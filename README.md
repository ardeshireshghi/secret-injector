# secret-injector

"SecretIngector" is a simple secret manager tool that uses AWS KMS (Key Management Service). It benefits from the concept of ["Envelope Encryption"](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#enveloping) which is a combination of CMK (Customer Master Keys) and data keys.

## How it works?

CMKs are created and kept in AWS and is used to create a new key pair which we call "data keys".  "Envelope Encryption" makes use of both data keys and CMKs. It uses data keys to encrypt plain text and CMKs to encrypt data keys. So we end up with with a data key pair. The Public key us used for encrpting plain text secrets and the private key (we keep the encrypted by CMK value) is used for decrypting secrets.

## Usage

### Installation

You can use yarn or npm to install the package. It requires Node.js >= 10 and IAM access (user or role) to an AWS account. For more information visit AWS documentation on setting up API access to AWS.

```bash
$ yarn global add @eardi/secret-injector
$ npm i -g @eardi/secret-injector
```

### Configuration

The Node.js module provides an easy to use CLI tool for configuring "SecretInjector". You need to have access to an AWS account by assuming an IAM role or IAM user. The bare minimum policies for the role or user are:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "DeveloperEncryptDecryptPolicy",
            "Effect": "Allow",
            "Action": [
                "kms:Decrypt",
                "kms:Encrypt",
                "kms:GenerateDataKeyPairWithoutPlaintext"
            ],
            "Resource": "*"
        }
    ]
}
```


```bash
$ secret-injector configure -h
secret-injector configure [key-id] [environment]

Configure secret injector for a given environment

Options:
      --version  Show version number                              [boolean]
  -v, --verbose  Run with verbose logging                         [boolean]
  -h, --help     Show help                                        [boolean]
  -k, --key-id   KMS key id                                      [required]
  -e, --env      Name of the environment (Default: "")

Examples:
  secret-injector configure --key-id     Configures the injector to use the
  78052d0b-7f50-41dd-a1df-c47fe3c13d02   KMS ID
  -e staging
```

The only dependency is a KMS key id, which can be created using AWS console, AWS CLI, Terraform or any other tool. `--env` argument is optional and is recommended in case of having multiple environments.

This is an example output of the command.

```json
{
  "kmsKeyId": "add343e7-a299-4b51-bf37-d495c0edeb34",
  "dataKeyPair": {
    "publicKey": "\n-----BEGIN PUBLIC KEY-----\n    MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEArLaT66pWpxLcntoVHxEiyl1sEwpsPBxqgnaZwgxJ+F/SUPJYLxI0fTDdA/TLHzK+GrqsgaWDZiG2Zv0Xu3IUuPuSzA0TeAXoXxMJpGpyDsGXcyWaCqb+Ufc0OKj4iqzS3u0WnXt7k82n9cK6sbjeyVVdUnigQsbrP9GyNbTZDFNmCadLxOC0rGjJRns4cYqGNnGelBCX6/04lQFqls3izwZ0Hy5onCA24pwbroLyk3XU7K60eTBGC//XvA2sjiyh//s9XmW1vCdiFjM7+i9jcGDvm47voz8WJrFYWjdO8xnWZWb9OPiZEexgaWtzYb+TH2kYSb+8323QKIF9ic3pNVZYfcb2keKVzgbxoxHH7z9VeTAztr2mVoZNlkp/hAtFG65CQpJ0UAdMBeTszRKPX9za2dtOXCdp1yQ8ejjpwgq4SFMdRuT3FMnpIQSq40OblobqjrDCTC3zKoeOhZxCJqCQq09JpxxpN30EateF7SJKFpAWiGCJeL4pap48IaH1VXRDQiUuuMsANYi0eFObyF25Ndj4eM+BGSf95/L8oIXoH0s+SiM63Iu9J8X2wrC1nhyKhwoiy5DM2DLhf+AIddIc99+9vVL03ZFXK5t1wlDUkomN3MEiNTU4K7zAf+FAJvHTj1kO2dwDpdIinc7LVwhOigD7MLtsDjHjWAt4lhsCAwEAAQ==\n-----END PUBLIC KEY-----",
    "privateKeyCipherText": "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"
  },
  "secrets": []
}
```

### Encrypt a new secret

You can use the `encrypt` command using the CLI to encrypt a new secret:

```bash
$ secret-injector encrypt -h
secret-injector encrypt [name] [secret-value] [environment]

Encrypts secret based on name and plaintext value

Options:
      --version       Show version number                         [boolean]
  -v, --verbose       Run with verbose logging                    [boolean]
  -h, --help          Show help                                   [boolean]
  -n, --name          Secret/Environment variable name           [required]
  -s, --secret-value  Plaintext secret to be encrypted           [required]
  -o, --output-only   Output only instead of updating/creating config
                                                                  [boolean]
  -e, --env           Name of the environment (Default: "")

Examples:
  secret-injector encrypt -n             Encrypts the value using the data
  DB_PASSWORD -s passwordplain -e        key pair in environment specfic
  staging                                config file
```

This uses the `publicKey` in the config file to encrypt the value and by default adds it to the config file associated with the `-e` in the command. For example:

```json
...
"secrets": [
    {
      "name": "DATABASE_PASSWORD",
      "encryptedValue": "o8E5OaYMM4sFmo+cuHz1VJFWm+3kDEi8Sof/qknqVUnw9VcJ27BC7FQDNOXuFZfT7slwBYZaMtn002Bt0OPO2dyUM8pa+zK13500zvOg0gLukqhzK0xufMkwhVdxmnaGBqRxem4I7MPivJIHgNnryYFnyE08u9ZjZPa/Z4HftQJ3Iq+KR3QEcp3BWiN8reVmPAHHRaGnS4DKF7WDFBCec2a9qrBnNkkiNQajbeBnQYozE6cE8RCrxwPKzMJfI/3ExU1T6rpw5pQmdnPzmgB3SB4D6RYaAlbV/SvVqyWU2DUoCqWmFaIaKbYisQcCa1ak0W+dc0mdHK17IneG+5SoHgAbwc3KI2XaJBbTKTebCO/GsfRlAC28/XcK0J5NoHCzlUxfjYAMMXrvR8+cI6QlPhYKKJQLgIrM0z6PR2E95d4h5jfkMUZFfBKnVKj/+dsqt6AjWvqkxnShybXbd/Eepb9W7BhswOGKQHUMSfvn9aOhQ8srQuW8HHsHtvXcHHX1THWHJYL4axPqi6GnAdi18edBFKcNIwZUiH9vXJG0EIyleY/LpupmKPKDai+3VFu/kz2TzSdDiBmbuOQLpHBFhhOiNFW06kuAAzItBmqv8cnqE6EUJi6y9hGsdOA/hFIBbIYRc2TmRxxYGUTP15lOwGKdfik3HG7n+iEO6vKZrXs="
    }
  ]
...
```
