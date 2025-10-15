// Script para verificar que las etiquetas canónicas estén funcionando correctamente
const https = require('https');

const testUrls = [
  'https://paulapastas.com',
  'https://paulapastas.com/pastas',
  'https://paulapastas.com/pastas/rellenas',
  'https://paulapastas.com/pastas/sin-relleno',
  'https://paulapastas.com/nosotros',
  'https://paulapastas.com/delivery'
];

function checkCanonicalTag(url) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'paulapastas.com',
      path: url.replace('https://paulapastas.com', ''),
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Buscar etiqueta canónica
        const canonicalMatch = data.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
        const canonicalUrl = canonicalMatch ? canonicalMatch[1] : null;
        
        // Verificar si hay múltiples etiquetas canónicas
        const allCanonicals = data.match(/<link[^>]*rel=["']canonical["'][^>]*>/gi);
        const canonicalCount = allCanonicals ? allCanonicals.length : 0;
        
        resolve({
          url,
          statusCode: res.statusCode,
          canonicalUrl,
          canonicalCount,
          hasCanonical: !!canonicalUrl,
          isCorrect: canonicalUrl && canonicalUrl.includes('paulapastas.com') && !canonicalUrl.includes('www.paulapastas.com')
        });
      });
    });

    req.on('error', (err) => {
      reject({
        url,
        error: err.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject({
        url,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

async function runVerification() {
  console.log('🔍 Verificando etiquetas canónicas en páginas principales...\n');
  
  const results = [];
  
  for (const url of testUrls) {
    try {
      const result = await checkCanonicalTag(url);
      results.push(result);
      
      console.log(`✅ ${url}`);
      console.log(`   Status: ${result.statusCode}`);
      console.log(`   Canonical: ${result.canonicalUrl || 'NO ENCONTRADA'}`);
      console.log(`   Count: ${result.canonicalCount}`);
      console.log(`   Correct: ${result.isCorrect ? '✅' : '❌'}`);
      console.log('');
    } catch (error) {
      console.log(`❌ ${url}`);
      console.log(`   Error: ${error.error}`);
      console.log('');
    }
  }
  
  // Resumen
  const correctCount = results.filter(r => r.isCorrect).length;
  const totalCount = results.length;
  
  console.log('📊 RESUMEN:');
  console.log(`   Páginas verificadas: ${totalCount}`);
  console.log(`   Canonicales correctas: ${correctCount}`);
  console.log(`   Porcentaje de éxito: ${Math.round((correctCount / totalCount) * 100)}%`);
  
  if (correctCount === totalCount) {
    console.log('🎉 ¡Todas las etiquetas canónicas están correctas!');
  } else {
    console.log('⚠️  Algunas etiquetas canónicas necesitan corrección.');
  }
}

runVerification().catch(console.error);
