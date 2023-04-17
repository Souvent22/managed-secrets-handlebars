# Deployment Guide

## Docker Deployment

The `locals.mk` should be created with the correct credentials:

```sh
export DOCKER_USERNAME = username
export DOCKER_PASSWORD = password
```

To tag a new version:
```sh
make bump-patch
git push --follow-tags
IMAGE_TAG=v0.0.6 make docker-build
IMAGE_TAG=v0.0.6 make docker-push
```

## Testing

You can use a test file such as:
```sh
NODE_ENV: {{aws-secret "some/aws/path/clients/env" "NODE_ENV" "base64"}}
NODE_ENV: {{doppler-secret "project/env/config" "APP_ENV" "base64"}}
```

And then a test script like:
```sh
#!/usr/bin/env bash

SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
TEST_TPL=$SCRIPTPATH/test-secrets.tpl

# Assumed DOPPLER_TOKEN, AWS_SECRET_ID, etc. is already set
# Or can be set like:
export DOPPLER_TOKEN=dopper-key-of-end-pulled-in

cd $SCRIPTPATH/../src/.

export TEMPLATE_INLINE=1

TEMPLATE_INLINE=1 cat $TEST_TPL | node compile-secrets.js
```

**TODO**
* Add tests