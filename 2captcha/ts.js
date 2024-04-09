const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const Captcha = require("2captcha-ts");
const solver = new Captcha.Solver("bd3d6a33966ff9f616fad8a5a302cfbc");

async function runTest(){

    puppeteer.use(stealthPlugin());
    let lanchParam = {
        headless: false,
       // ignoreDefaultArgs: ['--enable-automation'],
       // args: ['--disable-blink-features=AutomationControlled'],
       // executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    };

    const browser = await puppeteer.launch(lanchParam);

    let page = (await browser.pages())[0];
    //const page = await browser.newPage();

    await page.setViewport({ width: 1024, height: 768 });
    //await page.setDefaultNavigationTimeout(1 * 60 * 1000);


    await page.goto("https://www.tslines.com/kr/tracking?nowmenu=Search%20by%20BL%20number");

    const captchaSvg = await page.waitForSelector('::-p-xpath(//*[@id="id_content"]/div/div[3]/div/div[2]/div[2])');

    const rect = await page.evaluate(el =>{
        const {x, y, width, height} = el.getBoundingClientRect();
        return {x, y, width, height};
    }, captchaSvg);

 
    console.log("rect ",  rect);

    const base64Image = await page.screenshot({
        //path: 'captcha.png',
        encoding: 'base64',
        clip: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
        }
    });

    const solveRes = await solver.imageCaptcha({
        body: base64Image,
        numeric: 3,
        min_len: 4,
        max_len: 4
    });

    console.log(solveRes);

    const captchaSolve = solveRes.data;

    // Search by BL number
    const eInputBl = await page.waitForSelector('::-p-xpath(//*[@id="id_content"]/div/div[3]/div/div[1]/div[2]/input)');
    await eInputBl.type('100310451896');

    // Captcha
    const eInputCaptcha = await page.waitForSelector('::-p-xpath(//*[@id="id_content"]/div/div[3]/div/div[2]/div[1]/input)');
    await eInputCaptcha.type(captchaSolve);

    const eButtonGo = await page.waitForSelector('::-p-xpath(//*[@id="id_content"]/div/div[3]/div/div[3]/div/span[1]/p)');
    await eButtonGo.click();

}

runTest();