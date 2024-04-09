const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const Captcha = require("2captcha-ts");
const solver = new Captcha.Solver("bd3d6a33966ff9f616fad8a5a302cfbc");

const sleep = (sec) => new Promise((r) => setTimeout(r, sec * 1000));

async function runTest() {

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


    await page.goto("https://www.oocl.com/eng/ourservices/eservices/cargotracking/Pages/cargotracking.aspx");

    // 새 탭이 생성되는 것을 감지하고 해당 탭을 제어하기 위한 리스너를 설정합니다.
    browser.on('targetcreated', async (target) => {
        console.log('Triggering targetcreated ', target.type());

        if (target.type() === 'page') { // 새로운 페이지(탭)인지 확인합니다.
            const newPage = await target.page(); // 새로운 페이지에 대한 참조를 얻습니다.

            const captchaSlider = await newPage.waitForSelector('::-p-xpath(//*[@id="cscaptcha"])'); 

            const rect = await newPage.evaluate(el => {
                const {top, right, bottom, left, width, height} = el.getBoundingClientRect();
                return {top, right, bottom, left, width, height};
              }, captchaSlider);

            //document.querySelector('#cs_captcha > div.verify-bar-area > div > div > i').getBoundingClientRect()

            /*
            bottom: 340.296875
            height: 18
            left: 250.1875
            right: 268.1875
            top: 322.296875
            width: 18
            x: 250.1875
            y: 322.296875
            */

            /*
            await newPage.mouse.dragAndDrop({
                start : {x:251, y:323},
                target: {x:251, y:350}
            });
            */

            for(let i=0; i<100; i++){
                await newPage.mouse.move(251, 323);
                await sleep(1);
                await newPage.mouse.down();
                await sleep(1);
                await newPage.mouse.move(440, 323);
                await sleep(1);
                await newPage.mouse.up();
            
                let contentTable = null;

                try {
                    contentTable = await newPage.waitForSelector('::-p-xpath(//*[@id="contentTable"])', { timeout: 5000 }); 
                } catch(error) {
                    console.log('fail');
                    continue;
                }
                
                if(contentTable != null){
                    console.log("success");
                    break;
                }
            }
            
            console.log("gogogog scraping");

            await sleep(5);

            await newPage.close();
        }
    });

    let cnt = 0;
    browser.on('targetdestroyed', async(target) => {
        console.log('팝업 창이 닫혔습니다.');

        await sleep(10);

        if(cnt < 5){
            const ieSearchNumber = await page.waitForSelector('::-p-xpath(//*[@id="SEARCH_NUMBER"])');
            await ieSearchNumber.click({clickCount: 3});
            await ieSearchNumber.type('AAA'+ cnt);
            await sleep(1);
    
            const ieSearchButton = await page.waitForSelector('::-p-xpath(//*[@id="container_btn"])');
            await ieSearchButton.click();
    
            cnt = cnt+1;
        }
        
    });

    const eCookieAllow = await page.waitForSelector('::-p-xpath(//*[@id="allowAll"])', { timeout: 5000 });
    await eCookieAllow.click();


    const eSearchNumber = await page.waitForSelector('::-p-xpath(//*[@id="SEARCH_NUMBER"])');
    await eSearchNumber.type('2730547761');

    await sleep(3);

    const eSearchButton = await page.waitForSelector('::-p-xpath(//*[@id="container_btn"])');
    console.log('=============== eSearchButton =================');
    console.log(eSearchButton);
    await eSearchButton.click();

    console.log("(await browser.pages()) = ", (await browser.pages()).length);
    console.log('End~!!');
}

runTest();