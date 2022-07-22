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
const parseCommand = (json, mapper) => {
  let output = false
  for (let i = 0; i < mapper.commands.length; i++) {
    let command = mapper.commands[i]['command']
    if (command.originalName == json.command.name) {
      output = {
        command: {
          name: command.deviceName,
          params: {},
        },
      }
      //check params, if they don't match return false
      in_params = json.command.params
      if (typeof in_params == 'undefined' && typeof command.params !== 'undefined') return false
      let in_param_keys = Object.keys(json.command.params)
      for (let j = 0; j < in_param_keys.length; j++) {
        let key = in_param_keys[j]
        if (command.params[key]) {
          output.command.params[command.params[key]] = json.command.params[key]
        } else return false
      }
      break
    }
  }
  return output
}
module.exports = {
  parseCommand,
}
