const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { INJECTOR_ENV_VAR_PREFIX } = require('./constants');
const { configure, encrypt, inject } = require('./lib/commands');

const main = (argv) => {
  yargs(hideBin(argv))
  .command(
    'configure [key-id] [environment]',
    'Configure secret injector for a given environment',
    (yargs) => {
      yargs
        .alias('k', 'key-id')
        .describe('k', 'KMS key id')
        .alias('e', 'env')
        .describe('env', 'Name of the environment (Default: "")')
        .example(
          '$0 configure --key-id 78052d0b-7f50-41dd-a1df-c47fe3c13d02 -e staging',
          'Configures the injector to use the KMS ID'
        )
        .demandOption(['key-id']);
    },
    async (argv) => {
      if (argv.verbose) {
        console.info(`Creating config for KMS key with ID ${argv.keyId}`);
      }

      await configure(argv.keyId, argv.env);
    }
  )
  .command(
    'encrypt [name] [secret-value] [environment]',
    'Encrypts secret based on name and plaintext value',
    (yargs) => {
      yargs
        .alias('n', 'name')
        .describe('n', 'Secret/Environment variable name')
        .alias('s', 'secret-value')
        .describe('s', 'Plaintext secret to be encrypted')
        .alias('e', 'env')
        .describe('env', 'Name of the environment (Default: "")')
        .option('output-only', {
          alias: 'o',
          type: 'boolean',
          description: 'Output only instead of updating/creating config',
        })
        .example(
          '$0 encrypt -n DB_PASSWORD -s passwordplain -e staging',
          'Encrypts the value using the data key pair in environment specfic config file'
        )
        .demandOption(['n', 's']);
    },
    async (argv) => {
      await encrypt(argv.name, argv.secretValue, argv.env, argv.outputOnly);
    }
  )
  .command(
    'inject-env <sub-process>',
    'Inject secret values to sub processs',
    (yargs) => {
      yargs
        .alias('e', 'env')
        .describe('env', 'Name of the environment (Default: "")')
        .option('use-env-vars', {
          type: 'boolean',
          description: `Read the secrets from env vars starting with: ${INJECTOR_ENV_VAR_PREFIX}`,
        })
        .demandOption(['sub-process'])
        .example(
          '$0 inject-env -e staging sub-process [...args]',
          'Decrypts and injects secrets from config file of a given environment to sub process'
        )
        .example(
          '$0 inject-env --use-env-vars sub-process [...args]',
          'Decrypts and injects secrets using private key cihper and secret env vars to sub process'
        );
    },
    async (argv) => {
      await inject(argv);
    }
  )
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .help('h')
  .alias('h', 'help').argv;
};

exports.run = () => {
  main(process.argv);
};
