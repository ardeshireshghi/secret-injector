const privateKeyFromCipherText = require('./private-key-from-ciphertext');
const { decrypt } = require('./decryptor');
const { loadConfig } = require('./config-loader');

const {
  PRIVATE_KEY_CIPHER_VAR_NAME,
  INJECTOR_ENV_VAR_PREFIX
} = require('../constants');

const injectSecretsUsingEnv = async () => {
  if (!process.env[PRIVATE_KEY_CIPHER_VAR_NAME]) {
    throw new Error(
      `${PRIVATE_KEY_CIPHER_VAR_NAME} env variable is required for decrypting secrets`
    );
  }

  const privateKeyCipherText = process.env[PRIVATE_KEY_CIPHER_VAR_NAME];

  const privateKey = await privateKeyFromCipherText(privateKeyCipherText);

  const injectorEnvVariablesToDecrypt = Object.keys(
    process.env
  ).filter((envName) => envName.startsWith(INJECTOR_ENV_VAR_PREFIX));

  // Replace env variables with decrypted values
  injectorEnvVariablesToDecrypt.forEach((envVarName) => {
    process.env[envVarName.replace(INJECTOR_ENV_VAR_PREFIX, '')] = decrypt(
      privateKey,
      process.env[envVarName]
    );
    delete process.env[envVarName];
  });

  delete process.env[PRIVATE_KEY_CIPHER_VAR_NAME];
};

const injectSecretsUsingConfig = async (argv) => {
  const {
    dataKeyPair: { privateKeyCipherText },
    secrets
  } = await loadConfig(argv.env);
  const privateKey = await privateKeyFromCipherText(privateKeyCipherText);

  // Replace env variables with decrypted values
  secrets.forEach(({ name, encryptedValue }) => {
    process.env[name] = decrypt(privateKey, encryptedValue);
  });
};

module.exports = {
  injectSecretsUsingConfig,
  injectSecretsUsingEnv
};
