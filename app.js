const puppeteer = require('puppeteer')
const express = require('express')
const URL = require('url').URL
const app = express()


const TARGET_HOST = process.env.TARGET_HOST
const TIMEOUT = process.env.TIMEOUT || 5000
const PORT = process.env.PORT || 5000
const MAX_AGE = process.env.MAX_AGE || 600
const DEBUG_MODE = process.env.DEBUG_MODE == 'true' || false

if (!TARGET_HOST) {
  console.error('💥 Missing target host name, exiting.')
  process.exit(1)
}

app.get('/', (req, res) => {
  res.send('GET /shoot?path=…&selector=… to take a screenshot')
})

app.get('/shoot', async (req, res) => {
  const path = req.query.path
  const selector = req.query.selector
  const vpwidth = req.query.vpw * 1 || 1400
  const vpheight = req.query.vph * 1 || 700
  const padding = parseInt(req.query.padding) || 0

  if (!path || !selector) {
    res.status(422)
    return res.end()
  }

  const target = new URL(path, TARGET_HOST)

  try {
    const screenshot = await takeScreenshot(target, selector, padding, vpwidth, vpheight)
    if (screenshot) {
      res.type('image/png')
      res.header('Cache-Control', `max-age=${MAX_AGE}, s-max-age=${MAX_AGE}, public, must-revalidate`)
      res.send(screenshot)
    } else {
      console.error(`💥 takeScreenshot: no screenshot returned ${target}`)
      res.status(422)
      return res.end()
    }
  } catch (e) {
    console.error(`💥 takeScreenshot: error catched on ${target}`)
    console.error(e)
    res.status(500)
    res.end()
  }
})

app.listen(PORT, () => console.log(`Hotshot listening on port ${PORT}.`))

async function takeScreenshot (url, selector, padding = 0, vpwidth, vpheight) {
  let screenshot
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ],
    headless: !DEBUG_MODE
  })
  const page = await browser.newPage()

  page.setDefaultNavigationTimeout(TIMEOUT)
  page.setViewport({ width: vpwidth, height: vpheight, deviceScaleFactor: 2 })
  // page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto(url, { waitUntil: 'networkidle2' })
    .catch((err) => { 
      if (!DEBUG_MODE) browser.close()
      console.error(`💥 goto ${url} error`)
      throw err
    })

  const rect = await page.evaluate(selector => {
    const element = document.querySelector(selector)
    if (!element) {
      return null
    }
    const { x, y, width, height } = element.getBoundingClientRect()
    return { left: x, top: y, width, height, id: element.id }
  }, selector)
    .catch((err) => { 
      if (!DEBUG_MODE) browser.close()
      console.error(`💥 page.evaluate error on ${selector}`)
      throw err
    })

  if (rect) {
    const clip = {
      x: rect.left - padding,
      y: rect.top - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2
    }

    if (clip.x < 0 || clip.y < 0) {
      if (!DEBUG_MODE) browser.close()
      console.error(`💥 page.evaluate error on ${rect}`)
      throw Error(`element padding (${padding}) overflow from page (x: ${clip.x}, ${clip.y})`)
    }

    screenshot = await page.screenshot({
      // type: 'jpeg',
      // quality: 80,
      clip: clip
    })
      .catch((err) => { 
        if (!DEBUG_MODE) browser.close()
        console.error('💥 page.screenshot error')
        throw err
      })
    console.log(`📸 ${url} => ${selector}`)
  } else {
    console.error(`💥 Can't find selector ${url} => ${selector}`)
  }

  if (!DEBUG_MODE) browser.close()
  return screenshot
}
