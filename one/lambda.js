/*
    docker build --platform linux/amd64 -t cello-scraping-one:0.1 .

    docker run -d -v "$HOME\.aws-lambda-rie:/aws-lambda" -p 9000:8080 --entrypoint /aws-lambda/aws-lambda-rie cello-scraping-one:0.1 /usr/local/bin/npx aws-lambda-ric lambda.handler

    aws ecr create-repository --repository-name cello-scraping-one --region us-east-1 --image-scanning-configuration scanOnPush=true --image-tag-mutability MUTABLE

    {
        "repository": {
            "repositoryArn": "arn:aws:ecr:us-east-1:900512136082:repository/cello-scraping-one",
            "registryId": "900512136082",
            "repositoryName": "cello-scraping-one",
            "repositoryUri": "900512136082.dkr.ecr.us-east-1.amazonaws.com/cello-scraping-one",
            "createdAt": "2023-12-05T16:12:42+09:00",
            "imageTagMutability": "MUTABLE",
            "imageScanningConfiguration": {
                "scanOnPush": true
            },
            "encryptionConfiguration": {
                "encryptionType": "AES256"
            }
        }
    }

    docker tag cello-scraping-one:0.1 900512136082.dkr.ecr.us-east-1.amazonaws.com/cello-scraping-one:0.1

    docker push 900512136082.dkr.ecr.us-east-1.amazonaws.com/cello-scraping-one:0.1

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