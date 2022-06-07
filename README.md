# AWS Secrets via Handlebars Template
A docker container that fetches AWS secrets via handlebars templates.

This work was done to ease the use of AWS Secrets in Helm deployments.
Speicifcally, this is used during the deployment process to create 
a base64 encoded env file which is used on the Kubernetes secrets template
file in the helm deployment.

## Usage

The `aws-secret` helper takes 2 required and 1 optional argument: 
* Secret Id: The AWS secret ID.
* Secret Path: The secret path. If it is just, then just the name of the key. Or, if is nested, then dot syntax. e.g. `.db.user`
* Output: (optional) The output. This defaults to `string` and is not required. `base64` is also available.

**my-secrets.tpl**
```
NODE_ENV: {{aws-secret "my/aws/secrets/path/id" "NODE_ENV" "base64"}}
NODE_ENV: {{aws-secret "my/aws/secrets/path/id" "NODE_ENV"}}
```

The `base64` modifier transforms the output to `base64`, else the raw value of the secret value is placed. Usually with Kubernetes, one needs to put the value in `base64`, but other systems may only need/want the raw value of the secret.


```shell
docker run \
-e AWS_ACCESS_KEY_ID=YOUR_AWS_ID \
-e AWS_SECRET_ACCESS_KEY=YOUR_AWS_KEY \
-v $(pwd)/my-secrets.tpl:/usr/src/app/templates/secrets.tpl \
aws-secrets-handlebars:latests
```

You can also pipe your template file inline by using the env var
`TEMPLATE_INLINE`.

```shell
cat $(PWD)/my-secrets.tpl | docker run -i \
-e AWS_ACCESS_KEY_ID=YOUR_AWS_ID \
-e AWS_SECRET_ACCESS_KEY=YOUR_AWS_KEY \
-e TEMPLATE_INLINE=1 \
aws-secrets-handlebars:latest
```
