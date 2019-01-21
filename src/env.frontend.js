import getConfig from 'next/config';
const config = getConfig();
let env;
if (config) {
  env = config.publicRuntimeConfig;
} else {
  env = process.env;
}
export default env;
