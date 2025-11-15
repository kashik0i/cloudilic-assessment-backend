FROM node:24

WORKDIR /usr/src/app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

EXPOSE 4000

CMD ["pnpm", "start"]