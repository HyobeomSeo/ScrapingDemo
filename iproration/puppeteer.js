/*
const puppeteer = require('puppeteer');

(async () => {
  // SOCKS5 프록시 서버 주소와 포트
  //const proxyServer = 'socks5://ue2c9c239553905b7-zone-custom-region-kr:ue2c9c239553905b7@43.152.113.55:2333';
  //const proxyServer = 'http://43.152.113.55:2334:ue2c9c239553905b7-zone-custom-region-kr:ue2c9c239553905b7';
  const proxyServer ='http://43.152.113.55:2334:ue2c9c239553905b7-zone-custom:ue2c9c239553905b7';

  // Puppeteer 실행 시 SOCKS5 프록시 설정 추가
  const browser = await puppeteer.launch({
    headless: false,
    args: [`--proxy-server=${proxyServer}`]
  });

  // 새로운 페이지 열기
  const page = await browser.newPage();

  // 예제 웹사이트 접속
  await page.goto('http://www.google.com');

  // 페이지의 스크린샷 저장 (옵션)
  //await page.screenshot({ path: 'example.png' });

  // 브라우저 종료
  //await browser.close();
})();
*/
const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');


const url = 'https://api.sitcline.com/sitcline/query/cargoTrack';

(async () => {
  const proxyProtocol = 'http';
  
  const proxyServer = '43.152.113.55';
  const proxyPort = '2334';
  const proxyUsername = 'ue2c9c239553905b7-zone-custom-region-kr';
  const proxyPassword = 'ue2c9c239553905b7';


  const proxyUrl = `${proxyProtocol}://${proxyUsername}:${proxyPassword}@${proxyServer}:${proxyPort}`;



  // Create local authenticated tunnel with proxy-chain
  const proxyChainUrl = await proxyChain.anonymizeProxy(proxyUrl);
        
  // Launch Puppeteer with proxy configuration
  const browser = await puppeteer.launch({
    headless: false,
    args: [`--proxy-server=${proxyChainUrl}`, '--disable-sync']
  });
        
  const page = await browser.newPage();
        
  // Navigate to a website
  await page.goto(url);
        
  //await browser.close();
  //await proxyChain.closeAnonymizedProxy(proxyChainUrl);
})();
