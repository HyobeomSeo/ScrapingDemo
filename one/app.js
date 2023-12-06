const express = require('express');
const bodyParser = require('body-parser');
const scraping = require("./src/scraping");

const app = express();
const port = 3000;
const apiUrl = "/scraping/one";

// JSON 형식의 요청을 파싱하기 위해 bodyParser 사용
app.use(bodyParser.json());

app.post(apiUrl, async (req, res) => {
    try {
        // POST 요청에서 데이터 추출
        const blNo = req.body.blNo;

        // hblNo가 없거나 null인 경우 예외 발생
        if (blNo === undefined || blNo === null) {
            throw new Error('blNo is missing or null');
        }
    

        // 데이터를 콘솔에 출력 또는 원하는 작업 수행
        console.log('Received blNo:', blNo);

        let returnData = await scraping.runScraping(blNo);

        console.log(returnData);

        // 응답 보내기
        res.json(returnData);
    } catch (error) {
        // 예외가 발생한 경우 클라이언트에 오류 응답 보내기
        console.error('Error:', error.message);
        res.status(400).json({ error: 'Bad Request' });
    }
});

// 예외 처리를 위한 미들웨어 추가
app.use((error, req, res, next) => {
    console.error('Unhandled Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/${apiUrl}`);
});
