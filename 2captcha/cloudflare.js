const Captcha = require("2captcha-ts");
const solver = new Captcha.Solver("bd3d6a33966ff9f616fad8a5a302cfbc");
const axios = require('axios');

const hbl = 'LCHCW23032882';

async function testSolve(){
    /*
    solver.cloudflareTurnstile({
        pageurl: "https://www.rclgroup.com/Home#cargo",
        sitekey: "0x4AAAAAAACQHHcuQOrva-mq"    
    })
    .then((res) => {
        console.log(res);
    })
    .catch((err) => {
        console.log(err);
    })
    */

    let turnstile = "0.jM_Empqrh_v39v3Q-IwEJjEeQXVGcwxYFmk-HjlvxbOqtbRK4mG2XLNR0_YVkuM69jdowdnDrjauurp7GE2ESQ4UrBsZo39Azlk_UBhvOr6xVjQqj8hhkpUTJzQZianNpDAOH_405ph7HsxJrBJOi1SfXs0CliRiO0IjU91Gd_1lHTSu5alBTE3WeeIgjIdZdTxfpDygrbAAu_RWiH_DA8DzgUklJ36FzT5CVKrIWD41zlFCaIOpg9BMi4_Fgung-HyG6u4VwNg2Fhl_4kHQCW7vyXq_YnWqsbWPjmWx_7m8A3safPnWr3LpA-FjcgZsmOkHcrY1oVxTYLKuWjUjIIZcjKpbE1QidvtR1D7EcfQIrToiMnk1YVJEpgmTqbIdjGiOZgEkKwpD6334xH1NBwpC-y_O5xH8ty5On9f_571b07Pw58XacU3zShTlPxfT.yNFskUhIfgldReLlZQ0d2Q.b39c0e310497baa70d3322fc319ad09f2add4fa975a99b133ca464cbb65a885d";
    
    const solveRes = await  solver.cloudflareTurnstile({
        pageurl: "https://www.rclgroup.com/Home#cargo",
        sitekey: "0x4AAAAAAACQHHcuQOrva-mq"    
    });

    console.log(JSON.stringify(solveRes, null, 2));
    
    turnstile = solveRes.data;

    const token=convertStringToHex(Date.now().toString());

    console.log(token);

    const param = {
        blNo: hbl,
        token: token,
        turnstile: turnstile
    };

    console.log(JSON.stringify(param, null, 2));

/*
https://eservice.rclgroup.com/CargoTracking/cargoApi/cargoTracking
{"blNo":"LCHCW23032882","token":"41424443363831382d31373132353431303332383933","turnstile":"0.jM_Empqrh_v39v3Q-IwEJjEeQXVGcwxYFmk-HjlvxbOqtbRK4mG2XLNR0_YVkuM69jdowdnDrjauurp7GE2ESQ4UrBsZo39Azlk_UBhvOr6xVjQqj8hhkpUTJzQZianNpDAOH_405ph7HsxJrBJOi1SfXs0CliRiO0IjU91Gd_1lHTSu5alBTE3WeeIgjIdZdTxfpDygrbAAu_RWiH_DA8DzgUklJ36FzT5CVKrIWD41zlFCaIOpg9BMi4_Fgung-HyG6u4VwNg2Fhl_4kHQCW7vyXq_YnWqsbWPjmWx_7m8A3safPnWr3LpA-FjcgZsmOkHcrY1oVxTYLKuWjUjIIZcjKpbE1QidvtR1D7EcfQIrToiMnk1YVJEpgmTqbIdjGiOZgEkKwpD6334xH1NBwpC-y_O5xH8ty5On9f_571b07Pw58XacU3zShTlPxfT.yNFskUhIfgldReLlZQ0d2Q.b39c0e310497baa70d3322fc319ad09f2add4fa975a99b133ca464cbb65a885d"}
 */

    const axiosConfig ={
        headers: {'Content-Type': 'application/json', 
                  'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
                  'Sec-Ch-Ua-Platform': '"Windows"',
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
                }
    };

    const axiosInstance = axios.create(axiosConfig);

    const response = await axiosInstance.post('https://eservice.rclgroup.com/CargoTracking/cargoApi/cargoTracking', param);

    console.log(response.status);
    console.log(JSON.stringify(response.data, null, 2));
}


function convertStringToHex(str) {
    let hex = '';
   str= "ABDC"+"6818" + "-" +str;
    try {
      for (let i = 0; i < str.length; i++) {
        const character = str.charCodeAt(i).toString(16);
        hex += character;
      }
    } catch (ex) {
      throw ex;
    }
    return hex;
}

testSolve();