const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');

async function runTest(){
    puppeteer.use(stealthPlugin());
    let lanchParam = {
        headless: false,
        ignoreDefaultArgs: ['--enable-automation'],
        args: ['--disable-blink-features=AutomationControlled'],
       // executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    };

    const browser = await puppeteer.launch(lanchParam);

    let page = (await browser.pages())[0];
    //const page = await browser.newPage();

    await page.setViewport({ width: 800, height: 600 });
    await page.setDefaultNavigationTimeout(1 * 60 * 1000);


    await page.goto("https://api.sitcline.com/sitcline/query/cargoTrack");

    const captchaImgSelector = '.login-code-img';

    const rect = await page.evaluate(captchaImgSelector => {
        const element = document.querySelector(captchaImgSelector);
        if(element){
            const {top, left, width, height} = element.getBoundingClientRect();
            return {top, left, width, height};
        }
        return null;
    }, captchaImgSelector);

    console.log(rect);

    
    await page.screenshot({
        path: 'captcha.png',
        clip: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        }
    });
    

}

runTest();
