const env = require('../utils/env')

module.exports = {
  INGRESS_HOST: env('INGRESS_HOST', '127.0.0.1'),
  INGRESS_PORT: env('INGRESS_PORT', '8081'),
  MODULE_NAME: env('MODULE_NAME', 'generic-translator'),
  EGRESS_URL: env('EGRESS_URL', ''),
}
