const Promisify = require('util').promisify;
const File = require('fs');
const Path = require('path');

const hb = require('handlebars');
const Handlebars = require('handlebars-async-helpers')(hb);

const awsPlugin = require('./compile-aws');
const dopplerPlugin = require('./compile-doppler');

const secretVendorMapping = {
    'aws-secret': {
        fetchSecret: awsPlugin,
    },
    'doppler-secret': {
        fetchSecret: dopplerPlugin,
    }
};

const formatOutput = (value, output) => {
    if (output === "base64") {
        value = new Buffer.from(value).toString('base64');
    }
    return value;
};

Object.keys(secretVendorMapping).forEach((secretVendorNameId) => {
    Handlebars.registerHelper(secretVendorNameId, async function (secretPath, secretSelection, output="string") {
        let value = await secretVendorMapping[secretVendorNameId].fetchSecret(secretPath, secretSelection);
        return formatOutput(value, output);
      });    
});

const getFileContents = () => {
  const formatContent = function (content) {
    let formattedLines = [];
    // Use {{{}}}
    content.split(/\r?\n/).forEach(line =>  {
      let updatedLine = line;
      if (line === '') {
        return;
      }
      Object.keys(secretVendorMapping).forEach((prefix) => {
        if (line.indexOf(`{{{${prefix}`) === -1) {
          updatedLine = line.replace(`{{${prefix}`, `{{{${prefix}`).replace('}}', '}}}');
        }
      });
      formattedLines.push(updatedLine);
    });
    return formattedLines.join("\n");
  }
  if (process.env.TEMPLATE_INLINE) {
    return formatContent(File.readFileSync(0, 'utf-8'));
  }
  else {
    const filePath = Path.join(__dirname, 'templates/secrets.tpl');
    return formatContent(File.readFileSync(filePath, 'utf-8'));
  }
}

const main = async () => {
  // Compile the template
  const templateFileContents = getFileContents();
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
