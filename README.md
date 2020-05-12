# Hotshot

Takes screenshots of DOM elements, like Jake Gyllenhaal 📸

Check out the [blog post](https://www.innoq.com/en/blog/screenshot-dom-elements-puppeteer/).
forked from [innoq/hotshot](https://github.com/innoq/hotshot)

We change to use a [well-maintained image](https://hub.docker.com/r/alekzonder/puppeteer), which we don't need to maintain puppeteer by ourselves

## Start (without Docker)

Make sure you've got a current node and yarn installed. Then:

    $ yarn install
    $ TARGET_HOST="https://www.womany.net" yarn start

## Start (with Docker)

Build image:

    $ docker build -t womany/hotshot .
    
Remember to cleanup after building

Start server:

    $ docker run -d -p 5000:5000 -e PORT=5000 -e TIMEOUT=30000 -e TARGET_HOST='https://womany.net' womany/hotshot

## Request a screenshot:

    $ curl -G "https://maker.womany.net/shoot?path=genderpower%2fpedias%2f26187" > screenshot.png

    $ curl -G "https://localhost:5000/shoot?path=genderpower%2fpedias%2f26187&selector=.genderpedia&padding=5&vpw=645" > screenshot.png
