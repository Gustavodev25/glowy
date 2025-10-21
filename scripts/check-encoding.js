#!/usr/bin/env node

/**
 * Script para verificar problemas de encoding UTF-8 no projeto
 * Detecta caracteres mal codificados como Ã§, Ã£, Ã¡, etc.
 */

const fs = require('fs');
const path = require('path');

// Padrões de caracteres mal codificados
const ENCODING_ISSUES = [
  /Ã§/g,        // ç
  /Ã£/g,        // ã
  /Ã¡/g,        // á
  /Ã©/g,        // é
  /Ã­/g,        // í
  /Ã³/g,        // ó
  /Ã¢/g,        // â
  /Ã¹/g,        // ù
  /Ã§Ãµes/g,    // ções
  /Ãªncias/g,   // ências
  /Ã´/g,        // ô
  /Ã¢/g,        // â
  /Ã¨/g,        // è
  /Ã¬/g,        // ì
  /Ã¹/g,        // ù
  /Ã¿/g,        // ÿ
];

// Extensões de arquivos para verificar
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md'];

// Diretórios para ignorar
const IGNORE_DIRS = ['node_modules', '.next', 'dist', 'build', '.git'];

// Arquivos para ignorar (documentação e exemplos)
const IGNORE_FILES = [
  'ENCODING_GUIDE.md',
  'scripts/check-encoding.js'
];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      const relativePath = path.relative(process.cwd(), filePath);

      // Ignorar arquivos específicos
      if (IGNORE_FILES.some(ignoreFile => relativePath.endsWith(ignoreFile))) {
        return;
      }

      if (FILE_EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

function checkFileEncoding(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    ENCODING_ISSUES.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lines = content.split('\n');
          lines.forEach((line, lineIndex) => {
            if (line.includes(match)) {
              issues.push({
                file: filePath,
                line: lineIndex + 1,
                match: match,
                context: line.trim()
              });
            }
          });
        });
      }
    });

    return issues;
  } catch (error) {
    console.error(`Erro ao ler arquivo ${filePath}:`, error.message);
    return [];
  }
}

function main() {
  console.log('🔍 Verificando problemas de encoding UTF-8...\n');

  const projectRoot = process.cwd();
  const files = getAllFiles(projectRoot);
  let totalIssues = 0;

  files.forEach(file => {
    // Ignorar o próprio script de verificação
    if (file.includes('check-encoding.js')) {
      return;
    }

    const issues = checkFileEncoding(file);
    if (issues.length > 0) {
      console.log(`❌ ${file}`);
      issues.forEach(issue => {
        console.log(`   Linha ${issue.line}: "${issue.match}"`);
        console.log(`   Contexto: ${issue.context}`);
        console.log('');
        totalIssues++;
      });
    }
  });

  if (totalIssues === 0) {
    console.log('✅ Nenhum problema de encoding encontrado!');
    process.exit(0);
  } else {
    console.log(`\n❌ Encontrados ${totalIssues} problemas de encoding.`);
    console.log('\n💡 Dicas para corrigir:');
    console.log('   - Certifique-se de que o VS Code está configurado para UTF-8');
    console.log('   - Verifique as configurações de encoding do projeto');
    console.log('   - Use "Save with Encoding" -> UTF-8 no VS Code');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFileEncoding, getAllFiles };
