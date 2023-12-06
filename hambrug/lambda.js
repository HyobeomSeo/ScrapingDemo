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