FROM node:10

COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn

COPY . .

RUN yarn build

CMD ["node", "dist/index.js"]
