const axios = require('axios');

async function test(){

    const URL = "https://api64.ipify.org?format=json";

    let resDataForCon;
    
    await axios.get(URL, {
        proxy: {
            host: '174.138.108.252',
            port: 8001,
            auth: {
                username: 'scraperapi',
                password: '0c460eaa7113770b729ecc5cebfff8cc'
            },
            protocol: 'http'
        }
    })
        .then(response => {
            resDataForCon =  response.data;
        })
        .catch(error => {
            console.error(error);
        });

    console.log(resDataForCon);
}

test();