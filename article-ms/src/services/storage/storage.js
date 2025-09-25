'use strict';
const localProvider = require('./localProvider');
// const s3Provider = require('./s3Provider');

const STORAGE_DRIVER = process.env.STORAGE_DRIVER || 'local';

let provider;
switch (STORAGE_DRIVER) {
  case 's3':
    // provider = s3Provider;
    break;
  case 'local':
  default:
    provider = localProvider;
    break;
}

module.exports = provider;
