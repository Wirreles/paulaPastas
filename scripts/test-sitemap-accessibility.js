// Script para probar accesibilidad del sitemap desde diferentes user agents
const https = require('https');

const userAgents = [
  'Googlebot/2.1 (+http://www.google.com/bot.html)',
  'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
  'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
];

const sitemapUrl = 'https://paulapastas.com/sitemap.xml';

function testSitemapAccessibility(userAgent) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'paulapastas.com',
      path: '/sitemap.xml',
      method: 'HEAD',
      headers: {
        'User-Agent': userAgent
      }
    };

    const req = https.request(options, (res) => {
      resolve({
        userAgent,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        headers: res.headers
      });
    });

    req.on('error', (err) => {
      reject({
        userAgent,
        error: err.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject({
        userAgent,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 Probando accesibilidad del sitemap desde diferentes user agents...\n');
  
  for (const userAgent of userAgents) {
    try {
      const result = await testSitemapAccessibility(userAgent);
      console.log(`✅ ${userAgent}`);
      console.log(`   Status: ${result.statusCode} ${result.statusMessage}`);
      console.log(`   Content-Type: ${result.headers['content-type'] || 'N/A'}`);
      console.log(`   Content-Length: ${result.headers['content-length'] || 'N/A'}`);
      console.log('');
    } catch (error) {
      console.log(`❌ ${userAgent}`);
      console.log(`   Error: ${error.error}`);
      console.log('');
    }
  }
  
  console.log('🎯 Prueba completada. El sitemap debe ser accesible desde todos los user agents para un buen SEO.');
}

runTests().catch(console.error);
