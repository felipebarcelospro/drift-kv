#!/bin/bash

# 1. Renomear arquivos .js para .ts
echo "Renomeando arquivos .js para .ts em src e bin..."
find ./src ./bin -name "*.js" -exec bash -c 'mv "$0" "${0%.js}.ts"' {} \;

# 2. Atualizar binário no package.json
echo "Atualizando package.json para apontar para dist/bin/drift-kv.js"
jq '.bin["drift-kv"] = "./dist/bin/drift-kv.js"' package.json > package.tmp.json && mv package.tmp.json package.json

# 3. Compilar o TypeScript
echo "Compilando TypeScript..."
npm run build

# 4. Adicionar o Shebang ao arquivo de saída
OUTPUT_FILE="dist/bin/drift-kv.js"
echo "Adicionando Shebang ao arquivo compilado $OUTPUT_FILE..."
echo '#!/usr/bin/env node' | cat - "$OUTPUT_FILE" > temp && mv temp "$OUTPUT_FILE"
chmod +x "$OUTPUT_FILE"

echo "Conversão para TypeScript e configuração da CLI concluídas com sucesso!"
