# Hambrug Sud

## Basic Info.
Target URL : https://www.hamburgsud.com/tracking/

## Image Deployment Commands

+ For Lambda

    1. Move 'hambrug' folder
        ```
        cd hambrug
        ```

    2. Image for lambda build
        ```
        docker build --platform linux/amd64 -t cello-scraping-hambrug:{version_tag} -f .\Lambda.Dockerfile .
        ```

    3. Docker run by lambda local runtime
        ```
        docker run -d -v "$HOME\.aws-lambda-rie:/aws-lambda" -p 9000:8080 --entrypoint /aws-lambda/aws-lambda-rie cello-scraping-hambrug:{version_tag} /usr/local/bin/npx aws-lambda-ric lambda.handler
        ```
        cello-scraping-hambrug:{version_tag} : image name same with step2 

     4. Login AWS(Do only required)
        ```
        aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin {accountId}.dkr.ecr.us-east-1.amazonaws.com
        ```
        Reference Blog : https://velog.io/@shdrnrhd113/IAM-%EC%82%AC%EC%9A%A9%EC%9E%90-CLI-%EC%84%B8%ED%8C%85%ED%95%98%EA%B8%B0
        {accounId} : 900512136082

    5. Create AWS ECR Reposiory(Do only for first time)
        ```
        aws ecr create-repository --repository-name cello-scraping-hambrug --region us-east-1 --image-scanning-configuration scanOnPush=true --image-tag-mutability MUTABLE
        ```
        Get repository info like belows
        ```
        {
            "repository": {
                "repositoryArn": "arn:aws:ecr:us-east-1:900512136082:repository/cello-scraping-hambrug",
                "registryId": "900512136082",
                "repositoryName": "cello-scraping-hambrug",
                "repositoryUri": "900512136082.dkr.ecr.us-east-1.amazonaws.com/cello-scraping-hambrug",
                "createdAt": "2023-12-06T09:47:54+09:00",
                "imageTagMutability": "MUTABLE",
                "imageScanningConfiguration": {
                    "scanOnPush": true
                },
                "encryptionConfiguration": {
                    "encryptionType": "AES256"
                }
            }
        }
        ```
        need "repositoryUri" for next steps

    6. Tagging for ECR pushing
        ```
        docker tag cello-scraping-hambrug:{version_tag} 900512136082.dkr.ecr.us-east-1.amazonaws.com/cello-scraping-hambrug:{version_tag}
        ```

    7. Image push to ECR repository
        ```
        docker push 900512136082.dkr.ecr.us-east-1.amazonaws.com/cello-scraping-hambrug:{version_tag}
        ```

+ For Node API

     1. Move 'hambrug' folder
        ```
        cd hambrug
        ```

    2. Image for lambda build
        ```
        docker build --platform linux/amd64 -t cello-scraping-hambrug:{version_tag} -f .\Api.Dockerfile .
        ```
    
   3. Docker run by local API
        ```
        docker run -p 3000:3000 -d cello-scraping-hambrug:0.2
        ```