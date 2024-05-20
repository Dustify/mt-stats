FROM node:20 as mt-stats

USER node

WORKDIR /app

ADD package-lock.json .
ADD package.json .
ADD packages/ ./packages
ADD nx.json .
ADD lerna.json .

RUN npm config set @buf:registry https://buf.build/gen/npm/v1/

RUN npm ci --ignore-scripts
RUN npx lerna run build

FROM mt-stats as mt-stats-web
EXPOSE 3000
CMD npx lerna run start --scope=mt-stats-web

FROM mt-stats as mt-stats-srv
CMD npx lerna run start --scope=mt-stats-srv