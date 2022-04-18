const Promisify = require('util').promisify;
const File = require('fs');
const Path = require('path');

const hb = require('handlebars');
const HandlebarsAsync = require('handlebars-async-helpers')(hb);
const AWSSecretsManager = require('aws-sdk').SecretsManager;

// Create a Secrets Manager client
const client = new AWSSecretsManager({
  region: process.env.AWS_REGION || 'us-east-1',
});
const getSecretValuePromise = Promisify(client.getSecretValue).bind(client);

// In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
// See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
// We rethrow the exception by default.
const fetchSecretValue = async (awsSecretPath, secretSelection) => {

  try {
    const resp = await getSecretValuePromise({ SecretId: awsSecretPath });
    const secrets = JSON.parse(resp.SecretString);
    return secrets[secretSelection];

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

Handlebars.registerHelper('aws-secret', async function (awsSecretPath, secret, output="string") {
  let value = await fetchSecretValue(awsSecretPath, secret);
  if (output === "base64") {
    value = new Buffer.from(value).toString('base64');
  }
  return value;
});

const main = async () => {
  // Compile the template
  const filePath = Path.join(__dirname, 'templates/secrets.tpl');
  const templateFileContents = File.readFileSync(filePath, 'utf-8');
  const template = Handlebars.compile(templateFileContents);
  const output = template({});
  return output;
}

// Preferred method
(async () => {
  const response = await main();
  console.log(response);
  process.exit(0);
})().catch((e) => {
  // Deal with the fact the chain failed
  console.error(e);
  process.exit(1);
});
