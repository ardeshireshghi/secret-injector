const { promisify } = require('util');
const { KMS } = require('aws-sdk');
const fs = require('fs');

const { spawn } = require('child_process');

const { INJECTOR_ENV_VAR_PREFIX } = require('../constants');
const publicKeyFromBlob = require('./public-key-from-blob');
const { encryptUsingConfigFile } = require('./encryptor');
const {
  injectSecretsUsingEnv,
  injectSecretsUsingConfig
} = require('./inject-secrets');
const { configFileName, loadConfig } = require('./config-loader');

const kms = new KMS();
const generateDataKeyPairWithoutPlaintext = promisify(
  kms.generateDataKeyPairWithoutPlaintext.bind(kms)
);

const writeFile = promisify(fs.writeFile);

const execSubProcess = (command, args) => {
  const subProcess = spawn(command, args, {
    stdio: 'inherit'
  });

  subProcess.on('close', (code) => {
    console.log(`Sub process ${command} exited with code ${code}`);
  });

  subProcess.on('error', (err) => {
    console.error('Failed to run command', err);
  });
};

exports.configure = async (kmsKeyId, envName) => {
  const configFile = configFileName(envName);
  const dataKeyPair = await generateDataKeyPairWithoutPlaintext({
    KeyId: kmsKeyId,
    KeyPairSpec: 'RSA_4096'
  });

  const config = {
    kmsKeyId,
    dataKeyPair: {
      publicKey: publicKeyFromBlob(dataKeyPair.PublicKey),
      privateKeyCipherText: dataKeyPair.PrivateKeyCiphertextBlob.toString(
        'base64'
      )
    },
    secrets: []
  };

  await writeFile(configFile, JSON.stringify(config, null, 2));

  console.log(
    `Config file for environment ${envName} created in: %s, make sure to add it to version control`,
    `${process.cwd()}/${configFile}`
  );
};

exports.encrypt = async (
  secretName,
  secretValue,
  envName,
  outputOnly = false
) => {
  const encryptedValue = await encryptUsingConfigFile(secretValue, envName);
  const configFile = configFileName(envName);

  if (outputOnly) {
    console.log(
      `Secret encrypted successfully. Add this as environment variable to your configuration manager: \n\n${INJECTOR_ENV_VAR_PREFIX}${secretName}=${encryptedValue}`
    );
    return;
  }
  const config = await loadConfig(envName);
  const secretsMapByName = config.secrets.reduce(
    (updatedSecretsMap, currentSecret) => {
      return {
        ...updatedSecretsMap,
        [currentSecret.name]: currentSecret
      };
    },
    {}
  );

  secretsMapByName[secretName] = {
    name: secretName,
    encryptedValue
  };

  config.secrets = Object.values(secretsMapByName);

  await writeFile(configFile, JSON.stringify(config, null, 2));

  console.log(
    `Config file for environment ${envName} updated with new secret name ${secretName}`,
    `${process.cwd()}/${configFile}`
  );
};

exports.inject = async ({ useEnvVars = false, ...argv }) => {
  if (useEnvVars) {
    await injectSecretsUsingEnv(argv);
  } else {
    await injectSecretsUsingConfig(argv);
  }

  if (argv.verbose) {
    console.log(
      'Decrypted encrypted secrets, spawning and injecting decrypted env variables to the sub-process'
    );
  }

  // Run subprocess with injected secrets
  const args = argv._.slice(1);
  execSubProcess(argv.subProcess, args);
};
