import resolve from 'rollup-plugin-node-resolve';
// import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default {
  input: 'server/server.js',
  output: {
    file: 'server/bundle.js',
    format: 'cjs'
  },
  plugins: [
    resolve({
      preferBuiltins: true,
      module: false
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    json()
  ],
  external(id) {
    return id.indexOf('node_modules') >= 0;
  }
};