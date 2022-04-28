# Generic Translator Module

|                |                                     |
| -------------- | ----------------------------------- |
| Name           | Generic Translator Module           |
| Version        | v1.0.0                              |
| Dockerhub Link | [weevenetwork/generic-translator]() |
| Authors        | Mesud Pasic                         |

- [Generic Translator](#generic-translator)
  - [Description](#description)
  - [Features](#features)
  - [Environment Variables](#environment-variables)
    - [Module Specific](#module-specific)
    - [Set by the weeve Agent on the edge-node](#set-by-the-weeve-agent-on-the-edge-node)
  - [Dependencies](#dependencies)

## Description

Module translates commands from application to device compatible commands.

## Features

- Parsing Melita.io data for thermostat
- Sends data to next module service via REST API

### Module Specific

## Environment Variables

INGRESS_HOST and INGRESS_PORT are set by weeve Agent.

### Set by the weeve Agent on the edge-node

| Environment Variables | type   | Description               |
| --------------------- | ------ | ------------------------- |
| MODULE_NAME           | string | Name of the module        |

- Module translates JSON command input from MongoDB (application) to compatible command interface for specific device, so that encoder module can convert it to valid command
- Input JSON (example for McClimate Vicki Thermostat)

```js
{
  "manufacturer":"mcclimate",
  "device_type":"vickithermostat",
	"command":{
		"name": "setTemperatur",
		"params":{
			"value": 20
		}
	}
}
```

- Output JSON would look like

```js
{
  "command": {
    "name": "setTargetTemperature",
    "params": {
      "targetTemperature": 20
    }
  }
}
```

- In the case mapper doesn't contain command or valid parameters it will return false output like

```js
{
	"status": false,
	"message": "Bad command or parameters provided."
}
```

## Dependencies

```js
"dependencies": {
    "body-parser": "^1.19.2",
    "express": "^4.17.3",
    "express-winston": "^4.2.0",
    "node-fetch": "^2.6.1",
    "winston": "^3.6.0"
}
```
