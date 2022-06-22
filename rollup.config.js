import typescript from '@rollup/plugin-typescript'
import pkg from './package.json'

export default {
  input: './src/index.ts',
  output: [
    // 库打包的两种常用类型：CommonJS、ES6 Module
    {
      format: 'cjs',
      file: pkg.main
    },
    {
      format: 'es',
      file: pkg.module
    }
  ],
  plugins: [
    typescript()
  ]
}