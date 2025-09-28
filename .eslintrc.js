module.exports = {
  root: true,
  extends: [
    'universe/native',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
    // Desactiva la necesidad de importar React en cada archivo para React 17+
    'react/react-in-jsx-scope': 'off',
    // Permite el uso de 'require' en archivos de configuración
    '@typescript-eslint/no-var-requires': 'off',
    // Recomienda el uso de `type` para importaciones de tipos
    '@typescript-eslint/consistent-type-imports': 'warn',
    // Reglas para los hooks de React
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    // Desactiva una regla que puede ser molesta con los estilos de React Native
    '@typescript-eslint/no-use-before-define': 'off',
    // Orden de importación para mantener la consistencia
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@/**',
            group: 'internal',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['node_modules/', 'babel.config.js', 'metro.config.js', '.eslintrc.js'],
};
