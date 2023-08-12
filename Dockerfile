FROM node:20.5-alpine
RUN apk --no-cache add git

WORKDIR /
COPY . .
RUN npm install --force
CMD ["npm", "start"]
EXPOSE 80
