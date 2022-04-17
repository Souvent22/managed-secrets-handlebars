# syntax = docker/dockerfile:1.0-experimental
FROM node:17-alpine3.15

# Node/Alpine has yarn installed already
# autoconf automake libtool
# TODO: Use virtual packages to delete what is not needed.
# add --no-cache --virtual .build-deps autoconf automake libtool
# nasm libjpeg-turbo-utils
#RUN apk --no-cache add dumb-init git autoconf automake gcc make musl-dev libtool \
#    && mkdir -p /usr/src/app \
#    && mkdir -p /opt#

RUN apk add --no-cache openssh-client git python3 dumb-init autoconf automake gcc make musl-dev libtool g++

RUN mkdir -p -m 0600 ~/.ssh && \
    ssh-keyscan github.com >> ~/.ssh/known_hosts

RUN mkdir -p /usr/src/app/templates 

WORKDIR /usr/src/app

# Copy in the .env file, needed for the installation and build
COPY package.json ./

RUN yarn install

COPY src/compile-aws-secrets.js .
COPY src/sample.tpl ./templates/secrets.tpl

ENTRYPOINT node compile-aws-secrets.js
