import fs from 'fs';
import path from 'path';
import mimeTypes from 'mime-types';
import { getCheckSums } from '@bnb-chain/greenfiled-file-handle';
import chalk from 'chalk';

import { client } from '../utils/client';
import { logger } from '../utils/logger';

const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS || '';
const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY || '';

export const createObject = async ({
  filePath,
  objectName,
  bucketName,
}: {
  filePath: string;
  objectName: string;
  bucketName: string;
}) => {
  const fileBuffer = fs.readFileSync(filePath);
  const extname = path.extname(filePath);
  const fileType = mimeTypes.lookup(extname);

  logger.debug('check sums start:', filePath);
  const hashResult = await getCheckSums(fileBuffer);
  const { contentLength, expectCheckSums } = hashResult;
  logger.debug('check sums end:', filePath);

  try {
    logger.info('Checking an object for', chalk.cyan(objectName));
    const existObject = await client.object.headObject(bucketName, objectName);

    logger.debug('The objectName:', objectName, existObject);
    logger.info(`The object ${chalk.cyan(objectName)} already exist. skipped`);
  } catch (error) {
    logger.debug('The objectName:', objectName, error);
    logger.info('Creating an object for', chalk.cyan(objectName));

    // #2 create object.
    const createObjectTx = await client.object.createObject(
      {
        bucketName: bucketName,
        objectName: objectName,
        creator: ACCOUNT_ADDRESS,
        visibility: 'VISIBILITY_TYPE_PUBLIC_READ',
        fileType: fileType as string,
        redundancyType: 'REDUNDANCY_EC_TYPE',
        contentLength,
        expectCheckSums: JSON.parse(expectCheckSums),
      },
      {
        type: 'ECDSA',
        privateKey: ACCOUNT_PRIVATE_KEY,
      },
    );

    const createObjectTxSimulateInfo = await createObjectTx.simulate({
      denom: 'BNB',
    });

    const createObjectTxRes = await createObjectTx.broadcast({
      denom: 'BNB',
      gasLimit: Number(createObjectTxSimulateInfo?.gasLimit),
      gasPrice: createObjectTxSimulateInfo?.gasPrice || '5000000000',
      payer: ACCOUNT_ADDRESS,
      granter: '',
      privateKey: ACCOUNT_PRIVATE_KEY,
    });

    logger.info(
      'Object created successfully: ',
      createObjectTxRes.transactionHash,
    );

    // to upload
    const uploadRes = await client.object.uploadObject(
      {
        bucketName: bucketName,
        objectName: objectName,
        body: fileBuffer as any,
        txnHash: createObjectTxRes.transactionHash,
      },
      {
        type: 'ECDSA',
        privateKey: ACCOUNT_PRIVATE_KEY,
      },
    );

    if (uploadRes.code !== 0) {
      logger.error('Object upload failed:', {
        bucketName,
        objectName,
        uploadRes,
      });
    }
  }
};

export const createFolder = async ({
  bucketName,
  objectName,
}: {
  bucketName: string;
  objectName: string;
}) => {
  const _objectName = `${objectName}/`;
  try {
    logger.info('Checking a folder for', chalk.cyan(_objectName));
    const existObject = await client.object.headObject(bucketName, _objectName);

    logger.debug('The folder objectName:', _objectName, existObject);
    logger.info(
      `The folder object ${chalk.cyan(_objectName)} already exist. skipped`,
    );
  } catch (error) {
    logger.info('Creating a folder object for', chalk.cyan(_objectName));

    const createFolderTx = await client.object.createFolder(
      {
        bucketName: bucketName,
        objectName: _objectName,
        creator: ACCOUNT_ADDRESS,
      },
      {
        type: 'ECDSA',
        privateKey: ACCOUNT_PRIVATE_KEY,
      },
    );
    const simulateInfo = await createFolderTx.simulate({
      denom: 'BNB',
    });

    const res = await createFolderTx.broadcast({
      denom: 'BNB',
      gasLimit: Number(simulateInfo?.gasLimit),
      gasPrice: simulateInfo?.gasPrice || '5000000000',
      payer: ACCOUNT_ADDRESS,
      granter: '',
      privateKey: ACCOUNT_PRIVATE_KEY,
    });

    if (res.code === 0) {
      logger.info('Folder created successfully: ', res.transactionHash);
    }
  }
};

export const deleteObject = async ({
  bucketName,
  objectName,
}: {
  bucketName: string;
  objectName: string;
}) => {
  const deleteTx = await client.object.deleteObject({
    bucketName: bucketName,
    objectName: objectName,
    operator: ACCOUNT_ADDRESS,
  });

  const simulateInfo = await deleteTx.simulate({
    denom: 'BNB',
  });

  const res = await deleteTx.broadcast({
    denom: 'BNB',
    gasLimit: Number(simulateInfo?.gasLimit),
    gasPrice: simulateInfo?.gasPrice || '5000000000',
    payer: ACCOUNT_ADDRESS,
    granter: '',
    privateKey: ACCOUNT_PRIVATE_KEY,
  });

  if (res.code !== 0) {
    throw res;
  }

  return res.transactionHash;
};
