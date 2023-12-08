import * as log from 'loglevel';
import chalk from 'chalk';


const setLogLevel = (level: 'INFO' | 'DEBUG') => {
  log.setLevel(level || 'INFO')
}

const logger = {
  error: (...msg: any[]) => log.error(chalk.bold.red('[ERROR]:'), ...msg),
  debug: (...msg: any[]) => log.debug(chalk.bold.gray('[DEBUG]:'), ...msg),
  info: (...msg: any[]) => log.info(chalk.bold.cyan('[INFO]:'), ...msg),
  warn: (...msg: any[]) => log.warn(chalk.bold.yellow('[WARN]:'), ...msg),
}


export {
  logger,
  setLogLevel,
}

