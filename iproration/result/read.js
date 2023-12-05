const fs = require('fs');

const filePathPrefix = 'D:\\Cloud\\apache-jmeter-5.6.2\\bin\\response';
const fileCount = 100;

for (let i = 1; i <= fileCount; i++) {
    const filePath = `${filePathPrefix}${i}.plain`;
    
    // 파일을 동기적으로 읽어서 콘솔에 출력
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
   //     console.log(`Contents of ${filePath}:`);
        console.log(fileContent);
    } catch (error) {
        console.error(`Error reading file ${filePath}: ${error.message}`);
    }
}
