const env = require('../utils/env')

module.exports = {
  INGRESS_HOST: env('INGRESS_HOST', '127.0.0.1'),
  INGRESS_PORT: env('INGRESS_PORT', '8080'),
  MODULE_NAME: env('MODULE_NAME', 'Wohn.io Device Command Translator'),
  EGRESS_URLS: env('EGRESS_URLS', ''),
  RUN_AS_STANDALONE: env('RUN_AS_STANDALONE', 'yes'),
}
