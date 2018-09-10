FROM node:10

RUN yarn

RUN yarn build

CMD ["node", "dist/index.js"]