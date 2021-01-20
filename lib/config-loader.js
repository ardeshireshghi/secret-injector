const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

const {
  INJECTOR_CONFIG_FILE_PREFIX,
  INJECTOR_CONFIG_FILE_EXTENSION
} = require('../constants');

const configFileName = (envName) => {
  let fileName = INJECTOR_CONFIG_FILE_PREFIX;

  if (envName) {
    fileName += `.${envName}`;
  }

  return `${fileName}.${INJECTOR_CONFIG_FILE_EXTENSION}`;
};

const loadConfig = async (envName) => {
  const fileName = configFileName(envName);

  try {
    const configFileBuffer = await readFile(fileName);
    return JSON.parse(configFileBuffer.toString());
  } catch (err) {
    console.error(`Error loading the config file: ${fileName}`, err);
  }
};

exports.configFileName = configFileName;
exports.loadConfig = loadConfig;
