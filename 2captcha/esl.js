const axios = require('axios');
const https = require('https');
const cheerio = require('cheerio');
const Captcha = require("2captcha-ts");
const fs = require('fs').promises; 
const solver = new Captcha.Solver("bd3d6a33966ff9f616fad8a5a302cfbc");

async function testSolve() {

    const axiosConfig = {
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Encodin': 'gzip, deflate, br, zstd',
            'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
        }
    };

    const axiosInstance = axios.create(axiosConfig);

    axiosInstance.defaults.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    })

    const cargoHtml = await axiosInstance.get("https://www.emiratesline.com/cargotrracking/");

    console.log(cargoHtml.status);

    let $ = cheerio.load(cargoHtml.data);
    const capchaImageSrc = $('#siwp_captcha_image_0').attr('src');
    console.log(capchaImageSrc);

    const ctid = 'EPIRKRFGCL240177';
    const scid = extractIdFromUrl(capchaImageSrc);

    console.log(scid);

    const capchaImageRes = await axiosInstance.get(capchaImageSrc, { responseType: 'arraybuffer' });
    const base64Image = Buffer.from(capchaImageRes.data, 'binary').toString('base64');

    //console.log(base64Image);

    
    const solveRes = await solver.imageCaptcha({
        body: base64Image,
        numeric: 4,
        min_len: 5,
        max_len: 5
    });

    console.log(solveRes);
    
    const siwp_captcha_value = solveRes.data;

    const scode = 'tgCQK3v3QbHHzFs6';

    const param = `ctid=${ctid}&scid=${scid}&siwp_captcha_value=${siwp_captcha_value}&scode=${scode}`;

    console.log(param);

    const axiosConfig2 = {
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Encodin': 'gzip, deflate, br, zstd',
            'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    const axiosInstance2 = axios.create(axiosConfig2);

    axiosInstance2.defaults.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    })

    const resultRes = await axiosInstance2.post('https://www.emiratesline.com/cargotrracking', param);

    console.log('================== resultRes =========');
    console.log(resultRes.status);
    //console.log(resultRes.data);

    // #post-not-found > header > h1 
    // #main > div.container
    //await fs.writeFile('./eslres2.html', resultRes.data, 'utf8');

    $ = cheerio.load(resultRes.data);

    const containerDiv = $('#main > div.container').html();
    console.log(containerDiv);

    const postNotFoud = $('#post-not-found > header > h1').html();
    console.log(postNotFoud);

}

function extractIdFromUrl(urlString) {
    const url = new URL(urlString);
    const params = new URLSearchParams(url.search);
    const id = params.get('id'); // 'id' 매개변수의 값을 가져옵니다.
    return id;
}

async function testParseOK(){
    const html = await fs.readFile('./eslres.html', 'utf8');
    const $ = cheerio.load(html);

    const containerDiv = $('#main > div.container').html();
    console.log(containerDiv);
}

async function testParseNoResult(){
    const html = await fs.readFile('./eslres2.html', 'utf8');
    const $ = cheerio.load(html);

    const containerDiv = $('#post-not-found > header > h1').html();
    console.log(containerDiv);
}

testSolve();

//testParseOK();

//testParseNoResult();