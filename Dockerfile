FROM node:18-alpine AS base
WORKDIR /app


COPY package.json ./ 
RUN npm install --legacy-peer-deps
COPY . ./
RUN npm run build

CMD ["npm", "start"]
