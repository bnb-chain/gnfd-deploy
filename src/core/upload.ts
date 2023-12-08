import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

import { logger } from '../utils/logger';
import { createObject, createFolder } from './object';
import { createBucket } from './bucket';

const BUCKET_NAME = process.env.BUCKET_NAME || '';

const isFile = async (fp: string) => {
  return (await fs.lstat(fp)).isFile();
};

const uploadDir = async (bucketName: string, folderPath: string) => {
  const rootDir = path.dirname(folderPath);
  logger.info('The rootDir is: ', chalk.cyan(rootDir));

  const traverse = async (currentPath: string) => {
    // create folder
    const files = await fs.readdir(currentPath);
    const relativePath = path.relative(rootDir, currentPath);

    if (files.length > 0) {
      await createFolder({ bucketName, objectName: relativePath });

      for (const file of files) {
        const filePath = path.join(currentPath, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          await traverse(filePath);
        } else {
          // create file
          const pr = path.relative(rootDir, filePath);
          await createObject({
            bucketName,
            filePath: pr,
            objectName: pr,
          });
        }
      }
    } else {
      logger.warn('Folder is empty ->', relativePath, 'skipped.');
    }
  };

  await traverse(folderPath);
};

export const upload = async (filePath: string) => {
  try {
    logger.info('Start upload file:', filePath);

    const bucketName = BUCKET_NAME;
    // #1. Create bucket
    const bucketInfo = await createBucket(bucketName);
    let url = `${bucketInfo.endpoint}/view/${bucketInfo.bucketName}/`;

    if (await isFile(filePath)) {
      const basename = path.basename(filePath);
      await createObject({ bucketName, objectName: basename, filePath });
      url = `${url}${basename}`;
    } else {
      await uploadDir(bucketName, filePath);
    }

    logger.info('Upload Info:', bucketInfo);
    logger.info('File upload completed => baseUrl:', chalk.green(url));
  } catch (error) {
    logger.error('File upload failed:', error);
  }
};
