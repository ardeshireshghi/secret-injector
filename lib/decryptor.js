const crypto = require('crypto');

const decrypt = (privateKey, ciphertextBase64) => {
  const ciphertextBlob = Buffer.from(ciphertextBase64, 'base64');
  const decrypted = crypto.privateDecrypt(privateKey, ciphertextBlob);
  return decrypted.toString('utf8');
};

exports.decrypt = decrypt;
