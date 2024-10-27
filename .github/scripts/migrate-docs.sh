#!/bin/bash

# Função para processar um diretório recursivamente
process_directory() {
    local dir="$1"
    
    # Encontra todos os arquivos .md no diretório atual
    for file in "$dir"/*.md; do
        # Verifica se o arquivo existe e não é page.md
        if [ -f "$file" ] && [ "$(basename "$file")" != "page.md" ]; then
            # Extrai o nome base do arquivo (sem extensão)
            filename=$(basename "$file" .md)
            dirname=$(dirname "$file")
            
            # Cria nova pasta
            new_dir="$dirname/$filename"
            mkdir -p "$new_dir"
            
            # Move e renomeia o arquivo
            mv "$file" "$new_dir/page.mdx"
            
            echo "✓ Migrado: $file -> $new_dir/page.mdx"
        fi
    done
    
    # Processa subdiretórios
    for subdir in "$dir"/*/; do
        if [ -d "$subdir" ]; then
            process_directory "$subdir"
        fi
    done
}

# Diretório docs
DOCS_DIR="./"

# Verifica se o diretório existe
if [ ! -d "$DOCS_DIR" ]; then
    echo "Erro: Diretório $DOCS_DIR não encontrado!"
    exit 1
fi

echo "Iniciando migração dos arquivos..."
process_directory "$DOCS_DIR"
echo "Migração concluída!"