FROM node:20

EXPOSE 3000

USER node

WORKDIR /app

COPY src .
COPY package-lock.json .
COPY package.json .

RUN npm ci --ignore-scripts

CMD npm run start
# CMD bash