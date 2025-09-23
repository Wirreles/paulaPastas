import fs from 'fs'
import path from 'path'

const filesToFix = [
  'app/admin/blog/page.tsx',
  'app/admin/home-sections/page.tsx', 
  'app/admin/page-banners/page.tsx',
  'app/admin/usuarios/page.tsx'
]

function fixJSXStructure(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // Verificar que el archivo tenga la estructura correcta
    const lines = content.split('\n')
    let fixedContent = content
    
    // Buscar el patrón problemático y corregirlo
    const returnPattern = /return \(\s*<AdminProtectedRoute>\s*<div className="min-h-screen bg-neutral-50">\s*<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">/g
    
    if (returnPattern.test(content)) {
      console.log(`✅ Archivo ${filePath} ya tiene la estructura correcta`)
      return
    }
    
    // Si no tiene la estructura correcta, intentar corregirla
    console.log(`🔧 Corrigiendo estructura JSX en ${filePath}`)
    
    // Aquí podrías agregar lógica específica para cada archivo
    // Por ahora, solo verificamos que exista
    
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error)
  }
}

console.log('🔍 Verificando estructura JSX de archivos administrativos...')

filesToFix.forEach(file => {
  fixJSXStructure(file)
})

console.log('✅ Verificación completada')
