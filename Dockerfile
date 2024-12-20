FROM node:18-alpine3.17

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps --force && \
    npm install ajv@6.12.6

COPY . .

ENV NODE_ENV=production
ENV REACT_APP_API_URL=http://localhost:5001

RUN npm install -g webpack webpack-cli
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"] 