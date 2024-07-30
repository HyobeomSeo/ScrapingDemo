// index.js
const { Client } = require('@elastic/elasticsearch');

// Elasticsearch 클라이언트 인스턴스 생성
const client = new Client({ 
    node: 'https://822f0d5f89d64631b0e55284b5b9950f.ap-northeast-2.aws.elastic-cloud.com:443' ,
    auth: {
        apiKey: 'cWxWb3VwQUJZNTlxRHgzZmctdUU6MTFDM2c3bTVUem1kRzAtZF9DRzNKZ'
    }

});

async function run() {
  // 인덱스 생성
  await client.indices.create({
    index: 'test-index',
    body: {
      mappings: {
        properties: {
          message: { type: 'text' }
        }
      }
    }
  }, { ignore: [400] });

  // 문서 삽입
  await client.index({
    index: 'test-index',
    body: {
      message: 'Hello, Elasticsearch2222!'
    }
  });

  // 인덱스 강제 새로고침
  await client.indices.refresh({ index: 'test-index' });

  // 문서 검색
  const { body } = await client.search({
    index: 'test-index',
    body: {
        query: {
          match_all: {}
        }
    }
  });

  console.log(JSON.stringify(body));
}

run().catch(console.log);
