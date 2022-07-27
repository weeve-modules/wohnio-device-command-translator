const { EGRESS_URLS, INGRESS_HOST, INGRESS_PORT, MODULE_NAME, RUN_AS_STANDALONE } = require('./config/config.js')
const fetch = require('node-fetch')
const express = require('express')
const app = express()
const winston = require('winston')
const expressWinston = require('express-winston')
const { parseCommand } = require('./utils/translator')
const { formatTimeDiff } = require('./utils/util')
const fs = require('fs')
const path = require('path')
// initialization
app.use(express.urlencoded({ extended: true }))
app.use(
  express.json({
    verify: (req, res, buf, encoding) => {
      try {
        JSON.parse(buf)
      } catch (e) {
        res.status(400).json({ status: false, message: 'Invalid payload provided.' })
      }
    },
  })
)

// logger
app.use(
  expressWinston.logger({
    transports: [
      new winston.transports.Console(),
      /*
    new winston.transports.File({
        filename: 'logs/mclimate_encoder.log'
    })
    */
    ],
    format: winston.format.combine(winston.format.colorize(), winston.format.json()),
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: 'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function (req, res) {
      return false
    }, // optional: allows to skip some log messages based on request and/or response
  })
)
const startTime = Date.now()
// health check
app.get('/health', async (req, res) => {
  res.json({
    serverStatus: 'Running',
    uptime: formatTimeDiff(Date.now(), startTime),
    module: MODULE_NAME,
  })
})
// main post listener
app.post('/', async (req, res) => {
  const json = req.body
  if (!json || typeof json.command === 'undefined') {
    return res.status(400).json({ status: false, message: 'Data structure is not valid.' })
  }
  if (typeof json.manufacturer === 'undefined') {
    return res.status(400).json({ status: false, message: 'Manufacturer is not provided.' })
  }
  if (typeof json.device_type === 'undefined') {
    return res.status(400).json({ status: false, message: 'Device type is not provided.' })
  }
  // for now we read JSON file, later this should be in DB or somewhere else, like served from service
  let mapper = null
  switch (json.manufacturer.toLowerCase()) {
    case 'mcclimate':
      switch (json.device_type.toLowerCase()) {
        case 'vickithermostat':
          mapper = JSON.parse(fs.readFileSync(path.join(__dirname, '/mcclimatevickithermostat.json')))
          break
      }
  }
  if (!mapper) {
    return res
      .status(400)
      .json({ status: false, message: 'Could not load mapper data for selected Manufacturer and device type.' })
  }
  const result = parseCommand(json, mapper)
  if (result === false) {
    return res.status(400).json({ status: false, message: 'Bad command or parameters provided.' })
  }
  if (RUN_AS_STANDALONE !== 'no' || !EGRESS_URLS) {
    // parse data property, and update it
    return res.status(200).json({
      status: true,
      data: result,
    })
  } else {
    const callRes = await fetch(EGRESS_URLS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: result,
      }),
    })
    if (!callRes.ok) {
      return res.status(500).json({ status: false, message: `Error passing response data to ${EGRESS_URLS}` })
    }
    return res.status(200).json({ status: true, message: 'Payload processed' })
  }
})

// handle exceptions
app.use(async (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  const errCode = err.status || 401
  res.status(errCode).send({
    status: false,
    message: err.message,
  })
})

if (require.main === module) {
  app.listen(INGRESS_PORT, INGRESS_HOST, () => {
    console.log(`${MODULE_NAME} listening on ${INGRESS_PORT}`)
  })
}
