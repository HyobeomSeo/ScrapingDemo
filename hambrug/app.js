const scraping = require("./src/scraping");


async function main(pBlNo){
    let returnData = await scraping.runScraping(blNo);
    console.log(returnData);
}

const blNo = process.argv[2];
main(blNo);