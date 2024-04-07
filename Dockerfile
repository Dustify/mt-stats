FROM node:20

EXPOSE 3000

WORKDIR /app

ADD . .

RUN npm ci

CMD npm run start
# CMD bash