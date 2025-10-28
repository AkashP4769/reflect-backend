FROM node:alpine

WORKDIR  /backend

COPY  package*.json ./

RUN npm install

RUN npm install -g ts-node

COPY . .

RUN npm run build

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]