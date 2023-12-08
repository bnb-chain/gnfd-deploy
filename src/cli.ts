#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { logger, setLogLevel } from './utils/logger';

const pkg = require('../package.json');

const program = new Command();

program
  .name('gnfd-deploy')
  .description('Zero-Config CLI to Deploy Static Websites to BNB Greenfield')
  .version(pkg.version)
  .usage('[path] [options]');

program
  .argument('[path]', 'a relative file or directory local path.')
  .option('-d, --debug', 'use debug mode to see full error.');

program.exitOverride(() => process.exit());
program.parse();

const args = program.args;
const opts = program.opts();

if (opts.debug) {
  process.env.LOG_LEVEL = 'DEBUG';
}
setLogLevel(process.env.LOG_LEVEL as 'INFO');

const fPath = args[0];
if (!fPath) {
  program.help();
  process.exit();
}

const filePath = path.resolve(fPath);
if (fs.existsSync(filePath)) {
  const { upload } = require('./core/upload');
  upload(filePath);
} else {
  logger.error(`No such file or directory: ${chalk.cyan(filePath)}`);
}
