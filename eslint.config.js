import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

const REACT_ZUSTAND_IMPORT_ERROR =
  'src/logic/** and src/data/** are the pure domain core (hexagonal boundary) — they must never import react or zustand.';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // Hexagonal boundary (Architecture Spine, AD-agnostic paradigm rule):
    // the domain core never depends on the UI framework or the store.
    files: ['src/logic/**/*.{ts,tsx}', 'src/data/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: REACT_ZUSTAND_IMPORT_ERROR },
            { name: 'react-dom', message: REACT_ZUSTAND_IMPORT_ERROR },
            { name: 'zustand', message: REACT_ZUSTAND_IMPORT_ERROR },
          ],
          patterns: [
            { group: ['react/*', 'react-dom/*', 'zustand/*'], message: REACT_ZUSTAND_IMPORT_ERROR },
          ],
        },
      ],
    },
  },
);
