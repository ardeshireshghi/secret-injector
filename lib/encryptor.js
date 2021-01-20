const crypto = require('crypto');
const { loadConfig } = require('./config-loader');

const encryptUsingConfigFile = async (secretValue, envName) => {
  const config = await loadConfig(envName);
  const { publicKey } = config.dataKeyPair;
  return crypto
    .publicEncrypt(publicKey, Buffer.from(secretValue))
    .toString('base64');
};

exports.encryptUsingConfigFile = encryptUsingConfigFile;
