/*
    docker build --platform linux/amd64 -t cello-scraping-one:0.1 .

    docker run -d -v "$HOME\.aws-lambda-rie:/aws-lambda" -p 9000:8080 --entrypoint /aws-lambda/aws-lambda-rie cello-scraping-one:0.1 /usr/local/bin/npx aws-lambda-ric lambda.handler
 */

const scraping = require("./src/scraping");

exports.handler = async (event, context) => {
    console.log(event);

    const body = JSON.parse(event.body);
    const pBlNo = body.blNo;

    let returnData = await scraping.runScraping(pBlNo);

    const response = {
        statusCode: 200,
        body: JSON.stringify(returnData),
    };
    return response;
};