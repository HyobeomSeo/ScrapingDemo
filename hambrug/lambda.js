
/**
 * docker build --platform linux/amd64 -t cello-scraping-aws:0.1 .
 * 
 * docker run -p 9000:8080 cello-scraping-aws:0.2
 * 
 * docker run -d -v "$HOME\.aws-lambda-rie:/aws-lambda" -p 9000:8080 --entrypoint /aws-lambda/aws-lambda-rie cello-scraping-aws:0.1 /usr/local/bin/npx aws-lambda-ric lambda.handler
 * 
 * Invoke-WebRequest -Uri "http://localhost:9000/2015-03-31/functions/function/invocations" -Method Post -Body '{"blNo":"hello world!"}' -ContentType "application/json"
 * 
 * https://velog.io/@shdrnrhd113/IAM-%EC%82%AC%EC%9A%A9%EC%9E%90-CLI-%EC%84%B8%ED%8C%85%ED%95%98%EA%B8%B0
 * 
 * aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 900512136082.dkr.ecr.us-east-1.amazonaws.com
 * 
 * aws ecr create-repository --repository-name cello-scraping-aws --region us-east-1 --image-scanning-configuration scanOnPush=true --image-tag-mutability MUTABLE
 */


/**
 * {
    "repository": {
        "repositoryArn": "arn:aws:ecr:us-east-1:900512136082:repository/cello-scraping-aws",
        "registryId": "900512136082",
        "repositoryName": "cello-scraping-aws",
        "repositoryUri": "900512136082.dkr.ecr.us-east-1.amazonaws.com/cello-scraping-aws",
        "createdAt": "2023-11-29T19:09:59+09:00",
        "imageTagMutability": "MUTABLE",
        "imageScanningConfiguration": {
            "scanOnPush": true
        },
        "encryptionConfiguration": {
            "encryptionType": "AES256"
        }
    }
}

docker tag cello-scraping-aws:0.1 900512136082.dkr.ecr.us-east-1.amazonaws.com/cello-scraping-aws:latest

docker push 900512136082.dkr.ecr.us-east-1.amazonaws.com/cello-scraping-aws:latest

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