FROM node:16

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm install axios

EXPOSE 3000
CMD ["npm", "start"]