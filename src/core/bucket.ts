import chalk from 'chalk';

import { client, selectSp } from '../utils/client';
import { logger } from '../utils/logger';

const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS || '';
const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY || '';

export const createBucket = async (bucketName: string) => {
  const spInfo = await selectSp();
  logger.debug({ spInfo });

  const result = {
    address: ACCOUNT_ADDRESS,
    bucketName,
    bucketTx: '',
    endpoint: spInfo.endpoint,
    primarySpAddress: spInfo.primarySpAddress,
  };

  try {
    logger.info('Checking a bucketName for', chalk.cyan(bucketName));
    const existBucket = await client.bucket.headBucket(bucketName);

    logger.debug('The bucketName: ', bucketName, existBucket);
    logger.info(
      `The bucketName ${chalk.cyan(bucketName)} already exist. skipped`,
    );
    result.bucketTx = 'skipped';
  } catch (error) {
    logger.info('Creating a bucketName for', chalk.cyan(bucketName));

    const createBucketTx = await client.bucket.createBucket(
      {
        bucketName: bucketName,
        creator: ACCOUNT_ADDRESS,
        visibility: 'VISIBILITY_TYPE_PUBLIC_READ',
        chargedReadQuota: '0',
        spInfo: {
          primarySpAddress: spInfo.primarySpAddress,
        },
        paymentAddress: ACCOUNT_ADDRESS,
      },
      {
        type: 'ECDSA',
        privateKey: ACCOUNT_PRIVATE_KEY,
      },
    );

    const createBucketTxSimulateInfo = await createBucketTx.simulate({
      denom: 'BNB',
    });

    logger.debug('Gas fee: ', createBucketTxSimulateInfo);

    const createBucketTxRes = await createBucketTx.broadcast({
      denom: 'BNB',
      gasLimit: Number(createBucketTxSimulateInfo?.gasLimit),
      gasPrice: createBucketTxSimulateInfo?.gasPrice || '5000000000',
      payer: ACCOUNT_ADDRESS,
      granter: '',
      privateKey: ACCOUNT_PRIVATE_KEY,
    });

    logger.info(
      'Bucket created successfully:',
      createBucketTxRes.transactionHash,
    );
    result.bucketTx = `/tx/${createBucketTxRes.transactionHash}`;
  }

  return result;
};
