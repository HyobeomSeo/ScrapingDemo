const axios = require('axios');

exports.handler = async (event, context) => {
    try {
        // Lambda 함수의 실행 환경에서는 axios 모듈을 사용하여 외부 IP를 확인합니다.
        const response = await axios.get('https://api64.ipify.org?format=json');
        const ip_address = response.data.ip;
        
        // CloudWatch에 로그를 기록합니다.
        console.log(`Lambda IP Address: ${ip_address}`);
        
        return {
            statusCode: 200,
            body: JSON.stringify('IP address logged successfully!')
        };
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return {
            statusCode: 500,
            body: JSON.stringify('Error logging IP address.')
        };
    }
};