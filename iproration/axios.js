const axios = require('axios');
const username = 'ue2c9c239553905b7-zone-custom-region-kr';
const password = 'ue2c9c239553905b7';
const PROXY_DNS = '43.152.113.55';
const PROXY_PORT = 2334;

const url = 'https://api.sitcline.com/sitcline/query/cargoTrack';
axios
  .get(url, {
    proxy: {
      protocol: 'http',
      host: PROXY_DNS,
      port: PROXY_PORT,
      auth: {
        username,
        password,
      },
    },
  })
  .then((res) => {
    console.log(res.data);
  })
  .catch((err) => console.error(err));