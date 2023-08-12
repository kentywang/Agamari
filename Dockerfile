FROM node:20.5-alpine
RUN apk add --no-cache --virtual .gyp \  # gyp python make g++ are for node-gyp dependency (https://github.com/nodejs/docker-node/issues/282)
        python \
        make \
        g++ \
        git  # for npm install

WORKDIR /
COPY . .
RUN npm install --force
CMD ["npm", "start"]
EXPOSE 80
