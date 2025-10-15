// Script para probar redirecciones y detectar bucles
const https = require('https');

const testUrls = [
  'https://paulapastas.com',
  'https://www.paulapastas.com',
  'http://paulapastas.com',
  'http://www.paulapastas.com'
];

function testRedirect(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    let redirectCount = 0;
    let currentUrl = url;
    const redirectChain = [url];

    function makeRequest(urlToTest) {
      const options = {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
        },
        timeout: 10000
      };

      const req = https.request(urlToTest, options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          redirectCount++;
          redirectChain.push(res.headers.location);
          
          if (redirectCount > maxRedirects) {
            resolve({
              url,
              error: 'TOO_MANY_REDIRECTS',
              redirectCount,
              redirectChain,
              finalStatus: res.statusCode
            });
            return;
          }

          // Seguir la redirección
          const nextUrl = res.headers.location.startsWith('http') 
            ? res.headers.location 
            : new URL(res.headers.location, urlToTest).href;
          
          makeRequest(nextUrl);
        } else {
          resolve({
            url,
            finalUrl: currentUrl,
            finalStatus: res.statusCode,
            redirectCount,
            redirectChain,
            success: res.statusCode === 200
          });
        }
      });

      req.on('error', (err) => {
        resolve({
          url,
          error: err.message,
          redirectCount,
          redirectChain
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          url,
          error: 'TIMEOUT',
          redirectCount,
          redirectChain
        });
      });

      req.end();
    }

    makeRequest(url);
  });
}

async function runRedirectTests() {
  console.log('🔍 Probando redirecciones para detectar bucles...\n');
  
  for (const url of testUrls) {
    try {
      const result = await testRedirect(url);
      
      console.log(`🌐 ${url}`);
      console.log(`   Status final: ${result.finalStatus || 'ERROR'}`);
      console.log(`   Redirecciones: ${result.redirectCount}`);
      
      if (result.error === 'TOO_MANY_REDIRECTS') {
        console.log(`   ❌ BUCLE DE REDIRECCIÓN DETECTADO!`);
        console.log(`   Cadena: ${result.redirectChain.join(' → ')}`);
      } else if (result.success) {
        console.log(`   ✅ Redirección exitosa`);
        console.log(`   URL final: ${result.finalUrl}`);
      } else if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
      }
      
      console.log('');
    } catch (error) {
      console.log(`❌ ${url}`);
      console.log(`   Error: ${error.message}`);
      console.log('');
    }
  }
  
  console.log('🎯 Prueba completada. Si hay bucles de redirección, necesitamos corregirlos.');
}

runRedirectTests().catch(console.error);
