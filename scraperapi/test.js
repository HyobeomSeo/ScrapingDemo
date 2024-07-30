const puppeteer = require('puppeteer');

async function run() {

    // 프록시 서버 주소와 포트
  //const proxyServer = 'http://scraperapi:34a41a6ad8224a5b61b2d000ddd40a2c@proxy-server.scraperapi.com:8001';
  //const proxyServer = 'http://scraperapi:34a41a6ad8224a5b61b2d000ddd40a2c@174.138.108.252:8001';
  const proxyServer = 'http://174.138.108.252:8001';


  // ScraperAPI proxy configuration
  const PROXY_USERNAME = 'scraperapi';
  const PROXY_PASSWORD = '34a41a6ad8224a5b61b2d000ddd40a2c'; // <-- enter your API_Key here
  const PROXY_SERVER = 'proxy-server.scraperapi.com';
  const PROXY_SERVER_PORT = '8001';

  // Puppeteer 브라우저를 프록시 설정과 함께 실행
  const browser = await puppeteer.launch({
    headless:false,
    ignoreHTTPSErrors: true,
        args: [
            `--proxy-server=http://${PROXY_SERVER}:${PROXY_SERVER_PORT}`,
            '--ignore-certificate-errors',      // SSL 관련 오류 무시
      '--no-sandbox',                     // 샌드박스 모드 비활성화
      '--disable-setuid-sandbox',         // setuid 샌드박스 비활성화
      '--disable-dev-shm-usage',          // /dev/shm 사용 비활성화 (메모리 문제 방지)
      '--disable-web-security',           // 웹 보안 비활성화
      '--allow-running-insecure-content', // 보안되지 않은 콘텐츠 허용
      '--disable-features=IsolateOrigins,site-per-process', // 사이트 격리 비활성화
        ]
  });

  // 새로운 페이지 생성
  const page = await browser.newPage();

  await page.authenticate({
    username: PROXY_USERNAME,
    password: PROXY_PASSWORD,
  });

  await page.goto('https://api.sitcline.com/sitcline/query/cargoTrack', { waitUntil: 'networkidle2' });

}

run().catch(console.log);