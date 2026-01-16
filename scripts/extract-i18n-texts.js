#!/usr/bin/env node

/**
 * 国际化文本提取脚本
 *
 * 功能：
 * 1. 扫描前端代码中的硬编码文本
 * 2. 识别需要翻译的字符串
 * 3. 生成待翻译文本列表
 * 4. 输出建议的翻译键结构
 *
 * 使用方法：
 * node scripts/extract-i18n-texts.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// 配置
const CONFIG = {
  frontendDir: path.join(__dirname, '../frontend/src'),
  outputDir: path.join(__dirname, '../frontend/src/lib/locales'),
  filePatterns: [
    '**/*.tsx',
    '**/*.ts',
    '**/*.jsx',
    '**/*.js'
  ],
  excludePatterns: [
    '**/node_modules/**',
    '**/.next/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/*.test.{tsx,ts,jsx,js}',
    '**/*.spec.{tsx,ts,jsx,js}',
    '**/i18n/**',
    '**/locales/**'
  ]
};

// 需要提取的文本模式
const TEXT_PATTERNS = {
  // JSX 中的文本内容
  jsxText: />([^<>{}]+)</g,
  // 字符串字面量
  stringLiteral: /(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g,
  // 模板字符串中的纯文本（不含变量）
  templateString: /`([^${`]*)`/g,
  // 属性值
  attributeValue: /=\s*(['"])((?:(?!\1)[^\\]|\\.)*)(\1)/g,
};

// 排除的模式
const EXCLUDE_PATTERNS = {
  // 已经使用翻译的
  translated: /\bt\.\w+(\.\w+)*/,
  // HTML 标签
  htmlTag: /<\/?[\w\s="/']+>/,
  // CSS 类名
  className: /className[^=]*=\s*['"`][^'"`]*['"`]/,
  // 注释
  comment: /\/\/.*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/,
  // 导入语句
  import: /import\s+.*from\s+['"`].*['"`]/,
  // 类型定义
  typeDefinition: /:\s*['"`][A-Z][a-zA-Z]+['"`]/,
  // 短字符串（单个字符或数字）
  tooShort: /^[\d\s\W]{1,3}$/,
  // 技术术语
  technical: /^(div|span|button|input|form|label|id|class|href|src|alt|title|aria-[a-z]+|data-[a-z-]+)$/i,
  // 变量名
  variable: /^[a-z][a-zA-Z0-9]*$/,
  // API 路径
  apiPath: /^\/[a-z\/\-0-9]+$/,
  // HTML 属性
  htmlAttribute: /^[a-z-]+$/,
};

// 提取结果
const extractions = {
  byFile: {},
  byCategory: {
    buttons: new Set(),
    labels: new Set(),
    messages: new Set(),
    titles: new Set(),
    placeholders: new Set(),
    aria: new Set(),
    other: new Set()
  },
  allTexts: new Set()
};

/**
 * 检查文本是否应该被排除
 */
function shouldExclude(text) {
  const trimmed = text.trim();

  if (!trimmed || trimmed.length === 0) return true;
  if (trimmed.length > 100) return true; // 太长的文本
  if (EXCLUDE_PATTERNS.tooShort.test(trimmed)) return true;
  if (EXCLUDE_PATTERNS.technical.test(trimmed)) return true;
  if (EXCLUDE_PATTERNS.variable.test(trimmed) && trimmed.length < 10) return true;
  if (EXCLUDE_PATTERNS.apiPath.test(trimmed)) return true;
  if (EXCLUDE_PATTERNS.htmlAttribute.test(trimmed)) return true;

  return false;
}

/**
 * 检查文本是否已经被翻译
 */
function isTranslated(text) {
  return EXCLUDE_PATTERNS.translated.test(text);
}

/**
 * 分类文本
 */
function categorizeText(text, context) {
  const trimmed = text.trim().toLowerCase();

  // ARIA 标签
  if (context.includes('aria-')) {
    return 'aria';
  }

  // 占位符
  if (context.includes('placeholder')) {
    return 'placeholders';
  }

  // 按钮
  if (context.includes('button') || /^(submit|cancel|delete|save|edit|add|remove|create|update)$/i.test(trimmed)) {
    return 'buttons';
  }

  // 标签
  if (context.includes('label') || context.includes(' htmlFor')) {
    return 'labels';
  }

  // 标题
  if (context.includes('title') || context.includes('<h1') || context.includes('<h2') || context.includes('<h3')) {
    return 'titles';
  }

  // 消息/描述
  if (context.includes('description') || context.includes('message') || context.includes('alert') || text.length > 30) {
    return 'messages';
  }

  return 'other';
}

/**
 * 从文件内容中提取文本
 */
function extractFromFile(filePath, content) {
  const relativePath = path.relative(CONFIG.frontendDir, filePath);
  const fileTexts = [];

  // 移除注释
  let cleanedContent = content
    .replace(EXCLUDE_PATTERNS.comment, ' ')
    .replace(EXCLUDE_PATTERNS.import, ' ')
    .replace(EXCLUDE_PATTERNS.className, ' ');

  // 提取 JSX 文本
  const jsxMatches = cleanedContent.matchAll(>([^<>{}]+)</g);
  for (const match of jsxMatches) {
    const text = match[1]?.trim();
    if (text && !shouldExclude(text) && !isTranslated(text)) {
      const category = categorizeText(text, 'jsx');
      fileTexts.push({ text, category, type: 'jsx' });
      extractions.byCategory[category].add(text);
      extractions.allTexts.add(text);
    }
  }

  // 提取字符串字面量
  const stringMatches = cleanedContent.matchAll(/(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g);
  for (const match of stringMatches) {
    const text = match[2]?.trim();
    if (text && !shouldExclude(text) && !isTranslated(text) && /[a-zA-Z\u4e00-\u9fa5]/.test(text)) {
      // 检查上下文
      const beforeMatch = match.index;
      const context = cleanedContent.substring(Math.max(0, beforeMatch - 50), beforeMatch + 50);
      const category = categorizeText(text, context);

      // 只提取可能需要翻译的字符串
      if (/[\u4e00-\u9fa5]|[A-Z][a-z]+\s+[A-Z][a-z]+/.test(text) || text.includes(' ')) {
        fileTexts.push({ text, category, type: 'string', context });
        extractions.byCategory[category].add(text);
        extractions.allTexts.add(text);
      }
    }
  }

  if (fileTexts.length > 0) {
    extractions.byFile[relativePath] = fileTexts;
  }
}

/**
 * 扫描所有文件
 */
async function scanFiles() {
  console.log('🔍 扫描前端文件...\n');

  const patterns = CONFIG.filePatterns.map(p => path.join(CONFIG.frontendDir, p));

  for (const pattern of patterns) {
    const files = await glob(pattern, {
      cwd: CONFIG.frontendDir,
      ignore: CONFIG.excludePatterns.map(p => path.join(CONFIG.frontendDir, p)),
      absolute: true
    });

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        extractFromFile(file, content);
      } catch (error) {
        console.warn(`⚠️  无法读取文件: ${file}`);
      }
    }
  }
}

/**
 * 生成翻译键建议
 */
function generateTranslationKeySuggestions() {
  const suggestions = {};

  // 按分类生成建议
  for (const [category, texts] of Object.entries(extractions.byCategory)) {
    if (texts.size === 0) continue;

    suggestions[category] = {};

    for (const text of texts) {
      const key = generateKeyFromText(text);
      suggestions[category][key] = text;
    }
  }

  return suggestions;
}

/**
 * 从文本生成翻译键
 */
function generateKeyFromText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '_') // 空格转下划线
    .replace(/_+/g, '_') // 多个下划线转单个
    .substring(0, 50); // 限制长度
}

/**
 * 生成报告
 */
function generateReport() {
  console.log('📊 提取结果统计\n');
  console.log('='.repeat(60));

  // 按分类统计
  console.log('\n📁 按分类统计:');
  for (const [category, texts] of Object.entries(extractions.byCategory)) {
    if (texts.size > 0) {
      console.log(`  ${category.padEnd(20)} ${texts.size.toString().padStart(5)} 个`);
    }
  }

  // 按文件统计
  console.log('\n📄 按文件统计 (前10个):');
  const sortedFiles = Object.entries(extractions.byFile)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10);

  for (const [file, texts] of sortedFiles) {
    console.log(`  ${file.padEnd(50)} ${texts.length.toString().padStart(3)} 个`);
  }

  // 显示示例
  console.log('\n💡 提取的文本示例 (每个分类前5个):');
  for (const [category, texts] of Object.entries(extractions.byCategory)) {
    if (texts.size === 0) continue;

    console.log(`\n  ${category}:`);
    const examples = Array.from(texts).slice(0, 5);
    for (const text of examples) {
      console.log(`    - ${text.substring(0, 60)}${text.length > 60 ? '...' : ''}`);
    }
  }

  // 生成翻译键建议
  console.log('\n🔑 建议的翻译键结构:');
  const suggestions = generateTranslationKeySuggestions();

  for (const [category, items] of Object.entries(suggestions)) {
    if (Object.keys(items).length === 0) continue;

    console.log(`\n  ${category}:`);
    for (const [key, text] of Object.entries(items).slice(0, 5)) {
      console.log(`    ${key}: "${text}"`);
    }
  }

  console.log('\n' + '='.repeat(60));
}

/**
 * 保存结果到文件
 */
function saveResults() {
  const reportPath = path.join(CONFIG.outputDir, 'i18n-extraction-report.json');
  const suggestionsPath = path.join(CONFIG.outputDir, 'i18n-key-suggestions.json');

  // 保存详细报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: Object.keys(extractions.byFile).length,
      totalTexts: extractions.allTexts.size,
      byCategory: Object.fromEntries(
        Object.entries(extractions.byCategory).map(([k, v]) => [k, v.size])
      )
    },
    byFile: extractions.byFile,
    byCategory: Object.fromEntries(
      Object.entries(extractions.byCategory).map(([k, v]) => [k, Array.from(v)])
    ),
    keySuggestions: generateTranslationKeySuggestions()
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n✅ 详细报告已保存到: ${reportPath}`);

  // 保存翻译键建议
  const suggestions = generateTranslationKeySuggestions();
  fs.writeFileSync(suggestionsPath, JSON.stringify(suggestions, null, 2), 'utf-8');
  console.log(`✅ 翻译键建议已保存到: ${suggestionsPath}`);
}

/**
 * 主函数
 */
async function main() {
  console.log('🌍 国际化文本提取工具\n');
  console.log('目标目录:', CONFIG.frontendDir);
  console.log('输出目录:', CONFIG.outputDir);

  await scanFiles();
  generateReport();
  saveResults();

  console.log('\n✨ 完成！\n');
  console.log('💡 提示:');
  console.log('  1. 查看 i18n-extraction-report.json 获取详细报告');
  console.log('  2. 查看 i18n-key-suggestions.json 获取翻译键建议');
  console.log('  3. 根据建议手动调整翻译键结构');
  console.log('  4. 将建议的键添加到对应的语言文件中');
}

// 运行
main().catch(console.error);
