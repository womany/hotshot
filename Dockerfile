FROM node:12-buster-slim

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    --no-install-recommends \
    && apt-get install -y fonts-noto dumb-init \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && mkdir /app \
    && chown -R pptruser:pptruser /app

ENTRYPOINT ["dumb-init", "--"]

USER pptruser

WORKDIR /app

COPY --chown=pptruser:pptruser . .

ENV NODE_ENV=production
ENV MAX_AGE=86400

RUN yarn --cache-folder ./ycache && yarn install && rm -rf ./ycache

EXPOSE 5000

CMD ["node", "app.js"]
