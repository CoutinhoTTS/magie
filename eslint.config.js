// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu().append({
  rules: {
    'unicorn/prefer-dom-node-text-content': 'off',
  },
})
// .append({
//   files: ['./server/**/*.ts', './src/main/**/*.ts'],
//   rules: {
//     'no-console': 'off',
//     'top-level': 'warn',
//   },
// })
