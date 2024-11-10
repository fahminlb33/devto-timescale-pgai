FROM node:23-alpine

WORKDIR /app

RUN apk update && apk add --no-cache poppler-utils

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn run build

ENV PORT=5000

CMD ["yarn", "run", "start"]
