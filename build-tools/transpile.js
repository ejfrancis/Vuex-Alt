const transpile = require('transpile');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const transpileResult = transpile.to({
  name: "vuex-plus-plugin",
  source: fs.readFileSync(path.resolve(__dirname, './../src/index.js')).toString(),
  metadata: {format: "es6"},
  address: path.resolve(__dirname, './../src/index.js')
}, "cjs", {});
    
mkdirp.sync(path.resolve(__dirname, './../dist/')); 

fs.writeFileSync(path.resolve(__dirname, './../dist/index.js'), transpileResult.code);