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

    await page.setViewport({ width: 1680, height: 1050 });
    //await page.setDefaultNavigationTimeout(1 * 60 * 1000);


    await page.goto("https://api.sitcline.com/sitcline/query/cargoTrack");

    const captchaImgSelector = '.login-code-img';

    const rect = await page.evaluate(captchaImgSelector => {
        const element = document.querySelector(captchaImgSelector);
        if(element){
            const {x, y, width, height} = element.getBoundingClientRect();
            return {x, y, width, height};
        }
        return null;
    }, captchaImgSelector);

    console.log(rect);

    
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
    
    //console.log(base64Image);

    
    const solveRes = await solver.imageCaptcha({
        body: base64Image,
        numeric: 1,
        min_len: 4,
        max_len: 4
    });

    console.log(solveRes);


    const captchaSolve = solveRes.data;

    // #app > div > div:nth-child(3) > div > div > div.el-dialog__body > form > div.el-form-item.el-form-item--feedback.is-error.is-required.el-form-item--medium > div > div.el-input.el-input--medium.el-input--prefix.el-input--suffix > input
    // //*[@id="app"]/div/div[3]/div/div/div[2]/form/div[1]/div/div[1]/input

    // ID
    //const eInputId = await page.waitForXPath('//*[@id="app"]/div/div[3]/div/div/div[2]/form/div[1]/div/div[1]/input');
    //await eInputId.type('thinktip');    
    const eInputId = await page.waitForSelector('::-p-xpath(//*[@id="app"]/div/div[3]/div/div/div[2]/form/div[1]/div/div[1]/input)');
    await eInputId.type('thinktip');


    // PW
    // #app > div > div:nth-child(3) > div > div > div.el-dialog__body > form > div:nth-child(2) > div > div.el-input.el-input--medium.el-input--prefix.el-input--suffix > input
    // //*[@id="app"]/div/div[3]/div/div/div[2]/form/div[2]/div/div[1]/input
    const eInputPw = await page.waitForSelector('::-p-xpath(//*[@id="app"]/div/div[3]/div/div/div[2]/form/div[2]/div/div[1]/input)');
    await eInputPw.type('thinktip1234');
    
    // Captcha
    // #app > div > div:nth-child(3) > div > div > div.el-dialog__body > form > div:nth-child(3) > div > div > input
    // //*[@id="app"]/div/div[3]/div/div/div[2]/form/div[3]/div/div/input
    const eInputCaptcha = await page.waitForSelector('::-p-xpath(//*[@id="app"]/div/div[3]/div/div/div[2]/form/div[3]/div/div/input)');
    await eInputCaptcha.type(captchaSolve);

    // Button
    // #app > div > div:nth-child(3) > div > div > div.el-dialog__body > form > div:nth-child(5) > div > button
    // //*[@id="app"]/div/div[3]/div/div/div[2]/form/div[5]/div/button
    const eButtonLogin = await page.waitForSelector('::-p-xpath(//*[@id="app"]/div/div[3]/div/div/div[2]/form/div[5]/div/button)');
    await eButtonLogin.click();


    
    const eInputBl = await page.waitForSelector('::-p-xpath(//*[@id="app"]/div/div[2]/div/div[1]/form/div/div[2]/div/div/div[1]/input)');
    await eInputBl.type('SITKBSH23186332');
    

    
    const eButtonSearch = await page.waitForSelector('#app > div > div.index-container > div > div.search-container > form > div > div:nth-child(4) > button');
    await page.evaluate(() => {
        document.querySelector('#app > div > div.index-container > div > div.search-container > form > div > div:nth-child(4) > button').click();
    });
    
}

runTest();
