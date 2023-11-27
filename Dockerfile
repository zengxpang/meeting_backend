FROM node:18.0-alpine as build-stage

WORKDIR /app

COPY package.json ./

RUN npm install --package-lock-only

RUN npm ci

COPY  . .

RUN npm run build

ENV NODE_ENV production

# 运行'npm ci'会删除现有的node_modules目录，传入--Only=生产确保只安装生产依赖项。这确保node_modules目录尽可能优
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine As production-stage

COPY  --from=build-stage /app/node_modules ./node_modules
COPY  --from=build-stage /app/dist ./dist

CMD [ "node", "dist/main.js" ]
