const axios = require('axios');

const URL_GET_ONE = "https://ecomm.one-line.com/ecom/CUP_HOM_3301GS.do?_search=false&rows=10000&page=1&sidx=&sord=asc&f_cmd=121&search_type=A&search_name=";
const URL_POST_ONE = "https://ecomm.one-line.com/ecom/CUP_HOM_3301GS.do"

async function runScraping(pBlNo){
    
    let result;

    try{
        result = await doScraping(pBlNo);
    } catch(e) {
        result = {};
        result.status = "E";
        result.message = e;
    }

    let resultData;
    if(result.status == "S"){
        resultData = await composeData("CARRIER", pBlNo, result.containerDataArr);
    }

    const returnData = {
        "inputParam" : {"blNo" : pBlNo},
        "result" : result,
        "resultData" : resultData
    }

    return returnData;
}

async function doScraping(pBlNo){

    let result = {};
    
    let applyBlNo = removePrefix(pBlNo) // Follow 'Please enter only the last 12 characters of ONE BL number, without the prefix "ONEY".'

    let getUrl = URL_GET_ONE + applyBlNo; // add Bl No. for get param 'search_name';

    let resDataForCon;

    /* 
     * Step-1
     * Seach by bl No
     */
    await axios.get(getUrl)
        .then(response => {
            resDataForCon =  response.data;
        })
        .catch(error => {
            throw new Error(`Step-1 HTTP request failed: ${error.message}`);
        });

    if(!resDataForCon){
        throw new Error(`resDataForCon is not valid`);
    }

    let containerCnt = Number(resDataForCon.count);

    if(containerCnt == 0){
        // no result
        result.status = "W";
        result.message = "No Result";

        return result;
    }

    //console.log(resDataForCon.list);

    let containerDataArr = [];

    for(let containerIdx=0; containerIdx<containerCnt; containerIdx++){

        const container = await resDataForCon.list[containerIdx];
        
        const cntrNo = await container.cntrNo;
        const bkgNo = await container.bkgNo;
        const copNo = await container.copNo;

        let postPaylaod = {
            "f_cmd": null,
            "cntr_no" : cntrNo,
            "bkg_no" : bkgNo,
            "cop_no" : copNo
        }

        /*
        postPaylaod.f_cmd = 124;

        let resDataFor124;

        await axios.post(URL_POST_ONE, postPaylaod,{
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
            .then(response => {
                
                //console.log("################# respnse");
                //console.log(response);
                resDataFor124 =  response.data;
            })
            .catch(error => {
                throw new Error(`Step-2 HTTP request failed: ${error.message}`);
            });

        console.log(resDataFor124);
        */

        postPaylaod.f_cmd = 125;

        let tackingDetails;

        await axios.post(URL_POST_ONE, postPaylaod,{
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
            .then(response => {
                tackingDetails =  response.data;
            })
            .catch(error => {
                throw new Error(`Step-3 HTTP request failed: ${error.message}`);
            });

        const condainerData = {
            "cntr_no" : cntrNo,
            "bkg_no" : bkgNo,
            "cop_no" : copNo,
            "tackingDetails" : tackingDetails
        }

        containerDataArr.push(condainerData);
    }

    result.status = "S";
    result.message = "Sucess";
    result.containerDataArr = containerDataArr;

    return result;
}

// Function that removes the prefix 'ONEY' from the given text, if it starts with 'ONEY'.
// If the text does not start with the prefix, it is returned unchanged.
function removePrefix(text) {
    const prefix = 'ONEY';

    // Check if the given text starts with the specified prefix
    if (text.startsWith(prefix)) {
        // Remove the prefix and return the remaining part
        return text.slice(prefix.length);
    } else {
        // If the text does not start with the prefix, return it unchanged
        return text;
    }
}

async function composeData(pCarrier, pBlNo, pContainerDataArr){
    let returnData = [];

    let containerCnt = pContainerDataArr.length;

    for(let conIdx = 0; conIdx < containerCnt; conIdx++){
        const containerData = pContainerDataArr[conIdx];

        let SEQ = conIdx+1;
        let CARRIER = pCarrier;
        let BLNUMBER = pBlNo;
        let CNTRNUMBER = containerData.cntr_no;

        const tackingDetails = containerData.tackingDetails.list;
        let detailsCnt = tackingDetails.length;
        let sequencesCnt = 0;
        for(let detlIdx=0; detlIdx<detailsCnt; detlIdx++){
            const tackingDetail = tackingDetails[detlIdx];
            
            let o_statusNm = tackingDetail.statusNm;
            let o_statusCd = tackingDetail.statusCd;
            let o_eventDt = tackingDetail.eventDt;
            let o_placeNm = tackingDetail.placeNm;
            let o_actTpCd = tackingDetail.actTpCd;
            let o_nodCd = tackingDetail.nodCd;
            let o_vslEngNm = tackingDetail.vslEngNm;
            let o_vvd = tackingDetail.vvd;

            if(!o_eventDt || o_eventDt.length==0){ // When Event Date is empty, skip
                continue;
            }

            sequencesCnt++;

            let transInfo = extractTransInfo(o_statusNm, o_vslEngNm, o_vvd);

            let dataObj = {
                "SEQ" : SEQ,
                "SEQUENCE" : sequencesCnt,
                "CARRIER" : CARRIER,
                "BLNUMBER" : BLNUMBER,
                "CNTRNUMBER" : CNTRNUMBER,
                "EVENTCODEDESC" : o_statusNm,
                "LOCCODE" : extractUNLOC(o_nodCd),
                "LOCNAME" : o_placeNm,
                "FACILITIY" : null, // not exist
                "MODE" : transInfo.mode, // TRUCK or VESSEL
                "ESTTIME" : (o_actTpCd=='E' ? formatDate(o_eventDt):''), // not exist 
                "ACTTIME" : (o_actTpCd=='A' ? formatDate(o_eventDt):''),
                "VESSELNAME" : transInfo.vesselName, 
                "VOYAGENUMBER" : transInfo.voyageNumber,
                /*
                "o_statusNm" : o_statusNm,
                "o_eventDt" : o_eventDt,
                "o_placeNm" : o_placeNm,
                "o_actTpCd" : o_actTpCd,
                "o_nodCd" : o_nodCd,
                "o_vslEngNm" : o_vslEngNm,
                "o_vvd" : o_vvd,
                */
            };

            returnData.push(dataObj);

        }
    }

    return returnData;
}


// If the input starts with a sequence of non-numeric characters, that sequence is returned.
// If there is no such prefix, the original input string is returned unchanged.
function extractUNLOC(input) {
  // Use a regular expression to match the non-numeric prefix of the input string.
  const prefix = input.match(/^[^\d]+/);

  // If a non-numeric prefix is found, return it; otherwise, return the original input.
  return prefix ? prefix[0] : input;
}

// Function that extracts transportation information based on the provided parameters.
// 1. Input parameters are pStatusNm, pVslEngNm, and pVvd.
// 2. If pVslEngNm and pVvd are present, the transInfo mode is set to "VESSLE", and the vessel name is set to pVslEngNm.
//    The voyage number is extracted from pVvd, cutting it from the end until the first space is encountered.
// 3. If pVslEngNm and pVvd are absent and the case-insensitive substring 'rail' is found in pStatusNm,
//    the transInfo mode is set to "TRAIN"; otherwise, it is set to "TRUCK".
function extractTransInfo(pStatusNm, pVslEngNm, pVvd) {
  let transInfo = {mode:'', vesselName:'', voyageNumber:''};

  // Check if pVslEngNm and pVvd are present
  if (pVslEngNm && pVvd) {
    // Set mode to "VESSLE" and assign values
    transInfo.mode = "VESSLE";
    transInfo.vesselName = pVslEngNm;
    // Extract voyage number from pVvd by cutting it from the end until the first space is encountered
    // ex) pVslEngNm='ONE MAGDALENA' pVvd='ONE MAGDALENA 008E' extract '008E' for voyageNumber
    if(pVvd.length > pVslEngNm.length){
        transInfo.voyageNumber = pVvd.substring(pVslEngNm.length+1, pVvd.length);
    }
  } else {
    // Check if 'rail' (case-insensitive) is present in pStatusNm
    if (pStatusNm.toLowerCase().includes('rail')) {
      // Set mode to "TRAIN" if 'rail' is found
      transInfo.mode = "TRAIN";
      transInfo.vesselName = '';
      transInfo.voyageNumber = '';
    } else {
      // Set mode to "TRUCK" if 'rail' is not found
      transInfo.mode = "TRUCK";
      transInfo.vesselName = '';
      transInfo.voyageNumber = '';
    }
  }

  // Return the extracted transportation information
  return transInfo;
}

// Function that formats a date string in the format 'yyyy-MM-dd HH:mm' to 'yyyyMMddHHmmss'.
// The input date string is expected to be in the format 'yyyy-MM-dd HH:mm'.
function formatDate(inputDate) {
    // Split the input date string into date and time components
    const [datePart, timePart] = inputDate.split(' ');
  
    // Extract year, month, and day from the date component
    const [year, month, day] = datePart.split('-');
  
    // Extract hour and minute from the time component
    const [hour, minute] = timePart.split(':');
  
    // Create the formatted date string in the 'yyyyMMddHHmmss' format
    const formattedDate = `${year}${month}${day}${hour}${minute}00`;
  
    // Return the formatted date
    return formattedDate;
  }

module.exports ={runScraping};
