# aws-secrets-handlebars
A docker container that fetches AWS secrets via handlebars templates.

## Usage

**my-secrets.tpl**

```
NODE_ENV: {{aws-secret "my/aws/secrets/path/id" "NODE_ENV" "base64"}}
NODE_ENV: {{aws-secret "my/aws/secrets/path/id" "NODE_ENV"}}
```

```
docker run \
-e AWS_ACCESS_KEY_ID=YOUR_AWS_ID \
-e AWS_SECRET_ACCESS_KEY=AWS_SECRET_KEY \
-v $(pwd)/my-secrets.tpl:/usr/src/app/templates/secrets.tpl \
aws-secrets-handlebars:latests
```