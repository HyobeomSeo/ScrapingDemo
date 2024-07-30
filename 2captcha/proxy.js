const axios = require('axios');
const username = 'ue2c9c239553905b7-zone-custom-region-kr'; //'ue2c9c239553905b7-zone-custom-region-kr';
const password = 'ue2c9c239553905b7'; //'ue2c9c239553905b7';
const PROXY_DNS = '43.152.113.55'; //'43.152.113.55';
const PROXY_PORT = 2333; //2334;

const url = 'https://ebiz.namsung.co.kr/';
//const url = 'https://www.naver.com';
//const url = 'http://ip-api.com/json';

const setProxy = {
    protocol: 'http',
    host: PROXY_DNS,
    port: PROXY_PORT,
    auth: {
      username,
      password,
    },
  };

axios
  .get(url, {
    proxy: setProxy
  })
  .then((res) => {
    console.log(res);
  })
  .catch((err) => console.error(err));