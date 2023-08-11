# syntax=docker/dockerfile:1

FROM node:8.17-alpine
RUN apk --no-cache add git

WORKDIR /
COPY . .
RUN npm install --force
CMD ["npm", "start"]
EXPOSE 80
