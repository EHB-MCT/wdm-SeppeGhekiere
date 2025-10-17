
FROM node:20-alpine

WORKDIR /app

RUN apk update && apk add --no-cache curl

COPY package*.json ./

RUN npm install

COPY . .

HEALTHCHECK --interval=5s --timeout=5s --retries=5 \
  CMD curl -f http://localhost:3000/ || exit 1

EXPOSE 3000

CMD [ "npm", "start" ]
