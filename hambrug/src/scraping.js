const puppeteer = require("puppeteer");
const fs = require('fs');

const URL_HAMBURGSUD = "https://www.hamburgsud.com/tracking/";

async function runScraping(pBlNo){
    const browser = await lanchBrower();

    let result;

    try{
        result = await doScraping(browser, pBlNo);
    } catch(e) {
        result = {};
        result.status = "E";
        result.message = e;
    } finally {
        if(browser){
            await browser.close();
        }
    }

    let resultData;
    if(result.status == "S"){
        resultData = await composeData("CARRIER", pBlNo, result.containerNoArr, result.containerEventArr);
    }

    const returnData = {
        "inputParam" : {"blNo" : pBlNo},
        "result" : result,
        "resultData" : resultData
    }

    return returnData;
}

async function lanchBrower() {
    let lanchParam = {};
    lanchParam.headless = "new";

    // To check runtime environment whether local or image
    const isNotLocal = fs.existsSync("/usr/bin/google-chrome-stable");
    if(isNotLocal){
        lanchParam.executablePath = "/usr/bin/google-chrome-stable";
        lanchParam.args = ["--no-sandbox", "--disabled-setupid-sandbox"];
    }

    

    const browser = await puppeteer.launch(lanchParam);

    return browser;
}

async function doScraping(browser, pBlNo) {
 
    let result = {};

    console.log("BL No=%s", pBlNo);

    const page = (await browser.pages())[0];

    await page.setViewport({width : 1920, height : 2000});
    await page.setDefaultNavigationTimeout(1 * 60 * 1000);

    await page.goto(URL_HAMBURGSUD);

    /* 
     * Step-1
     * Close cookie aceept popup
     */
    const eCookieAcceptButtion = await page.waitForXPath('//*[@id="coiPage-1"]/div[2]/button[3]');
    if(eCookieAcceptButtion){ 
        await eCookieAcceptButtion.click();
    }

    /* 
     * Step-2
     * Input BL No.
     */
    const eBlNoInput = await page.waitForXPath('//*[@id="j_idt11:searchForm:j_idt16:inputReferences"]');
    await eBlNoInput.type(pBlNo);

    /* 
     * Step-3
     * Click Find Button
     */
    const eFindButton = await page.waitForXPath('//*[@id="j_idt11:searchForm:j_idt16:search-submit"]');
    await eFindButton.click();

    let eContainerTable;

     /*
      * Step-4
      * Scaping container no
      */
    try{
        eContainerTable = await page.waitForXPath('//*[@id="j_idt11:searchForm:j_idt31:j_idt33_data"]');
        console.log("eContainerTable loaded")
    } catch (e) {
        const eNoResultsSpan = await page.$x('//*[@id="j_idt11:searchForm:messages"]/div/ul/li/span');
        if(eNoResultsSpan && eNoResultsSpan[0]){
            const eNoResultsSpanInnerText = await page.evaluate(el =>el.innerText, eNoResultsSpan[0]);
            console.log('eNoResultsSpanInnerText %s', eNoResultsSpanInnerText);
            result.status = "W";
            result.message = "No Result";

            return result;
        }else{
            console.error(e);
            throw e;
        }
    }

    const trElements = await eContainerTable.$$('tr');

    /*
        * Step-5
        * Scaping container no
        */
    let containerNoArr = [];
    for (const tr of trElements) {
        const tdInnerTexts = await tr.$$eval('td', tds => tds.map(td => td.innerText));
        containerNoArr.push(tdInnerTexts[1]);
    }

    const iContainerCnt = trElements.length;
    
    let containerEventArr = [];
    for(let idx=0; idx<iContainerCnt; idx++){

        /*
         * Step-6
         * Click Container No link to see container events
         */
        const linkXpath = '//*[@id="j_idt11:searchForm:j_idt31:j_idt33:' + idx + ':contDetailsLink"]';
        const eContainerLink = await page.waitForXPath(linkXpath);
        eContainerLink.click();

        /*
         * Step-7
         * Scaping container events
         */
        const eContainerEvent = await page.waitForXPath('//*[@id="j_idt11:searchForm:j_idt45:mainContainerInformation_data"]');
        let tdInnerTextsArr = [];
        const trContainerEvent = await eContainerEvent.$$('tr');
        for (const tr of trContainerEvent) {
            const tdInnerTexts = await tr.$$eval('td', tds => tds.map(td => td.innerText));
            tdInnerTextsArr.push(tdInnerTexts);
        }
        containerEventArr.push(tdInnerTextsArr);

        /*
         * Step-8
         * Click back button to see next container events
         */
        const backButton = await page.waitForXPath('//*[@id="j_idt11:searchForm:j_idt45:contDetailsBackButton"]');
        await backButton.click();
    }

    result.status = "S";
    result.message = "Sucess";
    result.containerNoArr = containerNoArr;
    result.containerEventArr = containerEventArr;

    return result;
}

async function composeData(pCarrier, pBlNo, pContainerNoArr, pContainerEventArr){
    let returnData = [];

    let containerCnt = pContainerNoArr.length;

    for(let conIdx = 0; conIdx < containerCnt; conIdx++){
        let SEQ = conIdx+1;
        let CARRIER = pCarrier;
        let BLNUMBER = pBlNo;
        let CNTRNUMBER = pContainerNoArr[conIdx];

        let evtCnt = pContainerEventArr[conIdx].length;
        let sequencesCnt = 0;
        for(let evtIdx = evtCnt-1; evtIdx>=0; evtIdx--){
            sequencesCnt++;
            let evtData = pContainerEventArr[conIdx][evtIdx];
            let o_date = evtData[0];
            let o_place = evtData[1];
            let o_movement = evtData[2];
            let o_mode_vendor = evtData[3];
            let transInfo = extractTransInfo(o_movement, o_mode_vendor);

            let dataObj = {
                "SEQ" : SEQ,
                "SEQUENCE" : sequencesCnt,
                "CARRIER" : CARRIER,
                "BLNUMBER" : BLNUMBER,
                "CNTRNUMBER" : CNTRNUMBER,
                "EVENTCODEDESC" : o_movement,
                "LOCCODE" : extractUNLOC(o_place),
                "LOCNAME" : o_place,
                "FACILITIY" : null, // not exist
                "MODE" : transInfo.mode, // TRUCK or VESSEL
                "ESTTIME" : null, // not exist 
                "ACTTIME" : formatDate(o_date),
                "VESSELNAME" : transInfo.vesslename, // When MODE='VESSEL' mandatory
                "VOYAGENUMBER" : transInfo.voyagenumber, // When MODE='VESSEL' mandatory
                /*
                "o_date" : o_date,
                "o_place" : o_place,
                "o_movement" : o_movement,
                "o_mode_vendor" : o_mode_vendor,
                */
            };

            returnData.push(dataObj);
        }

    }

    return returnData;
}

function formatDate(pDate) {
    /*
     * Date Time format change
     * 27-AUG-2023 03:25 -> 20230827032500
     */

    // Map for converting month abbreviations to numeric values
    const monthMap = {
      'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
      'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
    };
  
    // Split the input date by whitespace
    const parts = pDate.split(' ');
  
    // Extract date and time parts
    const datePart = parts[0];
    const timePart = parts[1];
  
    // Split the date part by '-'
    const dateComponents = datePart.split('-');
  
    // Convert the month to a numeric value
    const month = monthMap[dateComponents[1]];
  
    // Assemble in the 'yyyyMMddHHmmss' format
    const formattedDate = `${dateComponents[2]}${month}${dateComponents[0]}${timePart.replace(':', '')}00`;
  
    return formattedDate;
}

function extractUNLOC(pPlace) {
    /*
     * Extract UNLOC from Place Description
     * 'Ho Chi Minh City VNSGN' -> 'VNSGN'
     */

    // Use regular expression to find sequences of 5 uppercase English letters
    const matches = pPlace.match(/[A-Z]{5}/);
  
    // If uppercase letters are found, return the first match; otherwise, return an empty string
    return matches ? matches[0] : '';
  }

let LAST_VESSELNAME, LAST_VOYAGENUMBER;

// Function to extract transportation information
// Function name: extractTransInfo
// Parameters:
//   - pMovement: Input parameter representing movement
//   - pModeVendor: Input parameter representing mode vendor
function extractTransInfo(pMovement, pModeVendor) {

    let isVessle = false;

    // Check if 'Vessel' is included in pMovement (case-insensitive)
    if (pMovement.toLowerCase().includes('vessel')) {
        // If pModeVendor has a value, split it using '\n' as a separator
        if (pModeVendor) {
            const [vesselName, voyageNumber] = pModeVendor.split('\n');
            LAST_VESSELNAME = vesselName; // Assign to LAST_VESSELNAME
            LAST_VOYAGENUMBER = voyageNumber; // Assign to LAST_VOYAGENUMBER
        }
        isVessle = true;
    } 

    // Create and return the result object
    const transInfo = {
        mode: isVessle ? 'VESSEL' : 'TRUCK', // Determine mode
        vesslename: isVessle ? LAST_VESSELNAME : '',
        voyagenumber: isVessle ? LAST_VOYAGENUMBER : ''
    };

    return transInfo;
}

module.exports ={runScraping};