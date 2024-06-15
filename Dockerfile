FROM node:20-alpine

WORKDIR /informer

COPY . /informer

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm i

RUN pnpm dev
