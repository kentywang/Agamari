FROM node:20.5-alpine
# gyp, python, make, g++ are for node-gyp dependency (https://github.com/nodejs/docker-node/issues/282)
# git is for npm install (we have one dependency, cannon.js, that is hosted from git)
RUN apk add --no-cache --virtual .gyp python3 make g++ git

WORKDIR /
COPY . .
RUN npm install --force
CMD ["npm", "start"]
EXPOSE 80
