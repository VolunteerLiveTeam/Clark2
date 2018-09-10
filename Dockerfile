FROM node:10

COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn

COPY . .

CMD ["node", "dist/index.js"]
