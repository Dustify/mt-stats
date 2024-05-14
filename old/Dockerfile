FROM node:20

EXPOSE 3000

USER node

WORKDIR /app

ADD package-lock.json .
ADD package.json .
ADD src/ ./src

RUN npm ci --ignore-scripts

CMD npm run start
# CMD bash