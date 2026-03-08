# using Node
FROM node:20

# create working directory
WORKDIR /app

# copy package files 
COPY package*.json ./

#Install deps 
RUN npm install

# Copy Project Files 
COPY . .

# Start server 
CMD ["node", "server.js"]


