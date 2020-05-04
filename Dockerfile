FROM alekzonder/puppeteer:latest

USER root

RUN apt-get update && apt-get -yq install gnupg

RUN echo 'deb http://deb.debian.org/debian sid main' >> /etc/apt/sources.list && \
    apt-get update && \
    apt autoremove && \
    apt-key update && \
    apt-get update && \
    apt-get install -yq -t unstable fonts-noto fonts-noto-cjk fonts-noto-cjk-extra && \
    apt-get clean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

USER pptruser

COPY --chown=pptruser:pptruser package.json yarn.lock ./
RUN yarn install

COPY --chown=pptruser:pptruser . /app

EXPOSE 5000

ENV NODE_ENV=production

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "app.js"]
