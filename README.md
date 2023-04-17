# [Managed Secrets via Handlebars Template](https://github.com/Souvent22/managed-secrets-handlebars)
A docker container that fetches Managed secrets via handlebars templates.

Currently the following vendors are supported:
* [AWS Secrets](https://aws.amazon.com/secrets-manager/)
* [Doppler ](https://www.doppler.com/)

This work was done to ease the use of Managed Secrets in Helm deployments.
Speicifcally, this is used during the deployment process to create 
a base64 encoded env file which is used on the Kubernetes secrets template
file in the helm deployment.

## Usage

**AWS Secrets**

The `aws-secret` helper takes 2 required and 1 optional argument: 
* Secret Id: The AWS secret ID.
* Secret Path: The secret path. If it is just, then just the name of the key. Or, if is nested, then dot syntax. e.g. `.db.user`
* Output: (optional) The output. This defaults to `string` and is not required. `base64` is also available.

**Doppler Secrets**

The `doppler-secret` helper takes 2 required and 1 optional argument: 
* Secret Id: The Doppler path in the pattern of `project-name/env-name/config-name`
* Secret Path: The specific secript in the config. E.g. `APP_ENV`
* Output: (optional) The output. This defaults to `string` and is not required. `base64` is also available.

Doppler secrets uses and expects the env var `DOPPLER_TOKEN`

**my-secrets.tpl**
```
NODE_ENV: {{aws-secret "my/aws/secrets/path/id" "NODE_ENV" "base64"}}
NODE_ENV: {{aws-secret "my/aws/secrets/path/id" "NODE_ENV"}}
APP_ENV:  {{doppler-secret "project-name/env-name/config-name" "APP_ENV"}}
```

The `base64` modifier transforms the output to `base64`, else the raw value of the secret value is placed. Usually with Kubernetes, one needs to put the value in `base64`, but other systems may only need/want the raw value of the secret.

```shell
docker run \
-e AWS_ACCESS_KEY_ID=YOUR_AWS_ID \
-e AWS_SECRET_ACCESS_KEY=YOUR_AWS_KEY \
-v $(pwd)/my-secrets.tpl:/usr/src/app/templates/secrets.tpl \
managed-secrets-handlebars:latests
```

```shell
docker run \
-e DOPPLER_TOKEN=TOKEN \
-v $(pwd)/my-secrets.tpl:/usr/src/app/templates/secrets.tpl \
managed-secrets-handlebars:latests
```

You can also pipe your template file inline by using the env var
`TEMPLATE_INLINE`.

```shell
cat $(PWD)/my-secrets.tpl | docker run -i \
-e AWS_ACCESS_KEY_ID=YOUR_AWS_ID \
-e AWS_SECRET_ACCESS_KEY=YOUR_AWS_KEY \
-e TEMPLATE_INLINE=1 \
managed-secrets-handlebars:latest
```

It is important to use `-i` when using `TEMPLATE_INLINE` so that the stdin is passed in.
