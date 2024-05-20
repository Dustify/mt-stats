FROM node:20 as mt-stats

USER node

WORKDIR /app

ADD --chown=node:node package-lock.json .
ADD --chown=node:node package.json .
ADD --chown=node:node packages/ ./packages
ADD --chown=node:node nx.json .
ADD --chown=node:node lerna.json .

RUN npm config set @buf:registry https://buf.build/gen/npm/v1/

RUN npm ci --ignore-scripts
RUN npx lerna run build

FROM mt-stats as mt-stats-web
EXPOSE 3000
CMD npx lerna run start --scope=mt-stats-web

FROM mt-stats as mt-stats-srv
CMD npx lerna run start --scope=mt-stats-srv