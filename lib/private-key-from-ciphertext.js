const { KMS } = require('aws-sdk');
const { promisify } = require('util');

const kms = new KMS();
const kmsDecrypt = promisify(kms.decrypt.bind(kms));

const privateKeyFromCipherText = async (privateKeyCipherText) => {
  const privateKeyCipherBlob = Buffer.from(privateKeyCipherText, 'base64');

  const params = {
    CiphertextBlob: privateKeyCipherBlob
  };
  const response = await kmsDecrypt(params);

  return `
-----BEGIN PRIVATE KEY-----
  ${response.Plaintext.toString('base64')}
-----END PRIVATE KEY-----`;
};

module.exports = privateKeyFromCipherText;
