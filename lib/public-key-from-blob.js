const publicKeyFromBlob = (publicKeyBlob) => {
  return `
-----BEGIN PUBLIC KEY-----
    ${publicKeyBlob.toString('base64')}
-----END PUBLIC KEY-----`;
};

module.exports = publicKeyFromBlob;
