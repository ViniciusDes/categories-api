FROM node:22-alpine

RUN mkdir -p /usr/app

WORKDIR /usr/app

COPY package.json ./

RUN yarn install

RUN yarn add cors

COPY . ./

EXPOSE 3334

CMD ["yarn", "dev"]