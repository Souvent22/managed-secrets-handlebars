const Promisify = require('util').promisify;

const AWSSecretsManager = require('aws-sdk').SecretsManager;

// Create a Secrets Manager client
const client = new AWSSecretsManager({
  region: process.env.AWS_REGION || 'us-east-1',
});
const getSecretValuePromise = Promisify(client.getSecretValue).bind(client);

const cachedSecrets = [];

// In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
// See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
// We rethrow the exception by default.
const fetchSecretValue = async (awsSecretPath, secretSelection) => {

  try {
    if (! cachedSecrets[awsSecretPath]) {
      const resp = await getSecretValuePromise({ SecretId: awsSecretPath });
      cachedSecrets[awsSecretPath] = JSON.parse(resp.SecretString);
    }
    return cachedSecrets[awsSecretPath][secretSelection];

  } catch(err) {
    // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
    // Deal with the exception here, and/or rethrow at your discretion.
    if (err.code === 'DecryptionFailureException') {
      throw err;
    }
      // An error occurred on the server side.
    // Deal with the exception here, and/or rethrow at your discretion.
    else if (err.code === 'InternalServiceErrorException') {
      throw err;
    }
      // You provided an invalid value for a parameter.
    // Deal with the exception here, and/or rethrow at your discretion.
    else if (err.code === 'InvalidParameterException') {
      throw err;
    }
      // You provided a parameter value that is not valid for the current state of the resource.
    // Deal with the exception here, and/or rethrow at your discretion.
    else if (err.code === 'InvalidRequestException') {
      throw err;
    }
      // We can't find the resource that you asked for.
    // Deal with the exception here, and/or rethrow at your discretion.
    else if (err.code === 'ResourceNotFoundException') {
      console.error('Unable to find secret ', secretName);
      throw err;
    }
    // Unknown error, just throw it.
    else {
      throw err;
    }
  }
};

module.exports = fetchSecretValue;