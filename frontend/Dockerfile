FROM node:16

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm install

# Copy project files
COPY . .

# Install axios explicitly
RUN npm install axios

EXPOSE 3000
CMD ["npm", "start"]