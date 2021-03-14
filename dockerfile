FROM node:15-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# copy the app, note .dockerignore
COPY . /usr/src/app
RUN yarn install

ENTRYPOINT [ "node", "index.js" ]