from node:22-alpine

Workdir /app

copy package.json ./

run npm install

copy . .

expose 5000

cmd ["npm", "start"]