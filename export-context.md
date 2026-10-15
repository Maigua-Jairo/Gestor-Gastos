# const fs = require('fs');

# const path = require('path');

# 

# // Nombre del archivo final que contendrÃ¡ todo tu cÃ³digo

# const OUTPUT\_FILE = 'contexto\_proyecto.md';

# const ROOT\_DIR = \_\_dirname;

# 

# // Carpetas que ignoramos porque son pesadas o no contienen cÃ³digo fuente Ãºtil

# const IGNORE\_DIRS = \['node\_modules', '.expo', '.vscode', '.opencode', '.git', 'assets', '\_\_tests\_\_', '.tamagui'];

# 

# // Archivos especÃ­ficos que no queremos incluir

# const IGNORE\_FILES = \['package-lock.json', 'yarn.lock', OUTPUT\_FILE, 'export\_context.js'];

# 

# // Extensiones permitidas

# const ALLOWED\_EXTENSIONS = \['.js', '.jsx', '.ts', '.tsx', '.json', '.md'];

# 

# function buildContext(currentPath) {

# &#x20;   const items = fs.readdirSync(currentPath);

# 

# &#x20;   for (const item of items) {

# &#x20;       const itemPath = path.join(currentPath, item);

# &#x20;       const stat = fs.statSync(itemPath);

# 

# &#x20;       if (stat.isDirectory()) {

# &#x20;           if (!IGNORE\_DIRS.includes(item)) {

# &#x20;               buildContext(itemPath);

# &#x20;           }

# &#x20;       } else {

# &#x20;           const ext = path.extname(item);

# &#x20;           const isAllowedExtension = ALLOWED\_EXTENSIONS.includes(ext);

# &#x20;           

# &#x20;           // Permitimos archivos de configuraciÃ³n que empiezan con punto (ej. .gitignore, eslint.config.js)

# &#x20;           const isConfigFile = item.startsWith('.') || item.includes('config'); 

# 

# &#x20;           if (!IGNORE\_FILES.includes(item) \&\& (isAllowedExtension || isConfigFile)) {

# &#x20;               try {

# &#x20;                   const content = fs.readFileSync(itemPath, 'utf8');

# &#x20;                   const relativePath = path.relative(ROOT\_DIR, itemPath);

# &#x20;                   

# &#x20;                   // Separador visual claro para que la IA distinga entre archivos

# &#x20;                   const separator = `\\n\\n================================================\\n`;

# &#x20;                   const fileHeader = `ðŸ“„ ARCHIVO: ${relativePath}\\n================================================\\n\\n`;

# &#x20;                   

# &#x20;                   fs.appendFileSync(path.join(ROOT\_DIR, OUTPUT\_FILE), separator + fileHeader + content);

# &#x20;               } catch (error) {

# &#x20;                   console.error(`Error leyendo ${itemPath}:`, error.message);

# &#x20;               }

# &#x20;           }

# &#x20;       }

# &#x20;   }

# }

# 

# // 1. Inicializar/Limpiar el archivo de salida

# fs.writeFileSync(path.join(ROOT\_DIR, OUTPUT\_FILE), '# Contexto Completo del Proyecto CV-CREATOR-APP\\n');

# console.log('â³ Recopilando cÃ³digo...');

# 

# // 2. Ejecutar la lectura

# buildContext(ROOT\_DIR);

# 

# console.log(`âœ… Â¡Listo! Todo tu cÃ³digo se ha consolidado en el archivo: ${OUTPUT\_FILE}`);

