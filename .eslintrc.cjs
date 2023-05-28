// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

/** @type {import("eslint").Linter.Config} */
const config = {
  overrides: [
    {
      extends: [
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: path.join(__dirname, 'tsconfig.json'),
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: path.join(__dirname, 'tsconfig.json'),
  },
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
  rules: {
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // "react" imports or starting with "react/"
          ['^react(?:/.*)?$'],
          // "next" imports or starting with "next/"
          ['^next(?:/.*)?$'],
          // Imports starting with a letter or "@"
          ['^[a-zA-Z@]'],
          // Imports starting with "~" our paths are set in tsconfig.json
          ['^~'],
          // Imports starting with ".."
          ['^\\.\\.'],
          // Imports starting with "."
          ['^\\.'],
          // Side effect imports
          ['^\\u0000'],
          // CSS files
          ['.*\\.css$'],
          // Anything not matched in another group
          ['^'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
    '@typescript-eslint/no-misused-promises': [
      2,
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      },
    ],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
}

module.exports = config
