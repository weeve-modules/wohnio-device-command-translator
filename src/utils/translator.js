/*
JSON coming from MongoDB:

command:{
  name: "setTemperatur",
  params:{
  "value": 20
  }
}

needs to be parsed and translated to correct command for device with correct param names with mapper structure:

 "command":
 {
      "originalName":"setTemperatur",
      "deviceName":"setTargetTemperature",
      "params":{
          "value":"targetTemperature"
      }
  }

*/
const { EGRESS_URLS } = require('../config/config')
const fetch = require('node-fetch')
const parseCommand = (json, mapper) => {
  let output = false
  for (let i = 0; i < mapper.commands.length; i++) {
    const command = mapper.commands[i].command
    if (command.originalName === json.command.name) {
      output = {
        command: {
          name: command.deviceName,
          params: {},
        },
      }
      // check params, if they don't match return false
      const inParams = json.command.params
      if (typeof inParams === 'undefined' && typeof command.params !== 'undefined') return false
      const inParamKeys = Object.keys(json.command.params)
      for (let j = 0; j < inParamKeys.length; j++) {
        const key = inParamKeys[j]
        if (command.params[key]) {
          output.command.params[command.params[key]] = json.command.params[key]
        } else return false
      }
      break
    }
  }
  return output
}

const send = async result => {
  if (EGRESS_URLS) {
    const eUrls = EGRESS_URLS.replace(/ /g, '')
    const urls = eUrls.split(',')
    urls.forEach(async url => {
      if (url) {
        try {
          const callRes = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(result),
          })
          if (!callRes.ok) {
            console.error(`Error passing response data to ${url}, status: ${callRes.status}`)
          }
        } catch (e) {
          console.error(`Error making request to: ${url}, error: ${e.message}`)
        }
      }
    })
  }
}

module.exports = {
  parseCommand,
  send,
}
