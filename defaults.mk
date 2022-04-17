export IMAGE_TAG ?= $(shell git rev-parse --short HEAD) # or latest
export PRIVATE_KEY_PATH ?= $(shell echo $$HOME/.ssh/id_rsa)
export DOCKER_REPO = aws-secrets-handlebars
export DOCKER_USERNAME ?= unknown
export DOCKER_PASSWORD ?= unknown
