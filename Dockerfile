FROM node:20.18.0

WORKDIR /informer

COPY . /informer/

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm i

