#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { logger, setLogLevel } from './utils/logger';
import { NETWORKS } from './config';

const pkg = require('../package.json');

const program = new Command();

program
  .name('gnfd-deploy')
  .description('Zero-Config CLI to Deploy Static Websites to BNB Greenfield')
  .usage('[path] [options]');

program
  .argument('[path]', 'A local file or folder relative or absolute path.')
  .option(
    '-a, --addr [addr]',
    "a Greenfield network address starting with '0x'",
  )
  .option(
    '-k, --key [key]',
    "private key for a Greenfield network account starting with '0x'.",
  )
  .option('-b, --bucket [bucket]', 'a bucket name similar to AWS S3')
  .option('-d, --debug', 'use debug mode to see full error.')
  .option(
    '-m, --mainnet',
    'upload file to Greenfield mainnet network.[testnet]',
  )
  .version(pkg.version);

program.exitOverride(() => process.exit());
program.parse();

const args = program.args;
const opts = program.opts();

// debug
if (opts.debug) {
  process.env.LOG_LEVEL = 'DEBUG';
}
setLogLevel(process.env.LOG_LEVEL as 'INFO');

// network
if (opts.mainnet) {
  process.env.GREENFIELD_RPC_URL = NETWORKS.mainnet.rpc;
  process.env.GREENFIELD_CHAIN_ID = NETWORKS.mainnet.chainId;
} else if (
  !process.env.GREENFIELD_RPC_URL &&
  !process.env.GREENFIELD_CHAIN_ID
) {
  process.env.GREENFIELD_RPC_URL = NETWORKS.testnet.rpc;
  process.env.GREENFIELD_CHAIN_ID = NETWORKS.testnet.chainId;
}

// bucket,privateKey,address
if (opts.bucket) {
  process.env.BUCKET_NAME = opts.bucket;
}
if (opts.key) {
  process.env.ACCOUNT_PRIVATE_KEY = opts.key;
}
if (opts.addr) {
  process.env.ACCOUNT_ADDRESS = opts.addr;
}
if (
  !process.env.BUCKET_NAME ||
  !process.env.ACCOUNT_PRIVATE_KEY ||
  !process.env.ACCOUNT_ADDRESS
) {
  logger.error('BucketName, PrivateKey, and Address parameters are required.');
  process.exit();
}

const fPath = args[0];
if (!fPath) {
  logger.error('path is required.');
  process.exit();
}

const filePath = path.resolve(fPath);
if (fs.existsSync(filePath)) {
  logger.info(
    'Start upload file to:',
    process.env.GREENFIELD_RPC_URL,
    process.env.GREENFIELD_CHAIN_ID,
  );

  const { upload } = require('./core/upload');
  upload(filePath);
} else {
  logger.error(`No such file or directory: ${chalk.cyan(filePath)}`);
}
