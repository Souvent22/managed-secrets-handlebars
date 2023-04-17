
const https = require('https')

const cachedSecrets = [];

const getDopplerSecret = async (secretPath) => {
    return new Promise(function(resolve, reject) {
        https.get(`https://${process.env.DOPPLER_TOKEN}@api.doppler.com/v3/configs/config/secrets/download?format=json`, (res) => {
          let secrets = ''
          res.on('data', (data) => secrets += data);
          res.on('end', () => resolve(JSON.parse(secrets)))
        }).on('error', (e) => reject(e))
      })
}

const getDopplerServiceTokenPath = async () => {
    return new Promise(function(resolve, reject) {
        https.get(`https://${process.env.DOPPLER_TOKEN}@api.doppler.com/v3/configs/config?format=json`, (res) => {
          let secrets = ''
          res.on('data', (data) => secrets += data);
          res.on('end', () => resolve(JSON.parse(secrets)))
        }).on('error', (e) => reject(e))
      })
}

const fetchSecretValue = async (secretPath, secretItem) => {
    try {
        const configInfo = await getDopplerServiceTokenPath(secretPath);
        const serviceTokenPath = `${configInfo.config.project}/${configInfo.config.environment}/${configInfo.config.name}`;

        if (secretPath !== serviceTokenPath) {
            throw new Error(`The service token path ${serviceTokenPath} for this token is not equal to the path in the template of ${secretPath}`);
        }

        if (! cachedSecrets[secretPath]) {
            const resp = await getDopplerSecret(secretPath);
            cachedSecrets[secretPath] = resp;
          }
          return cachedSecrets[secretPath][secretItem];
    } catch(e) {
        console.error(e.message);
        return false;
    }
}

module.exports = fetchSecretValue;