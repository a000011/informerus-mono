FROM node:20.18.0

WORKDIR /informer

COPY . /informer/

RUN npm install -g pnpm

RUN pnpm i

