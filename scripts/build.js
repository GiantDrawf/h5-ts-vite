/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-07-27 16:25:27
 * @LastEditors: zhujian
 * @LastEditTime: 2021-09-26 11:26:08
 * @Description: 你 kin 你擦
 */

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const webpack = require('webpack');
const fs = require('fs-extra');
const configFactory = require('../config/webpack.config');
const paths = require('../config/paths');

const config = configFactory('production');
const compiler = webpack(config);

fs.emptyDirSync(paths.appBuild);

build()
  .then(({ stats }) => {
    // TODO: 输出打包结果信息
    console.log(
      stats.toString({
        colors: true,
      })
    );
  })
  .catch((err) => {
    if (err) {
      console.error(err);
    }
    process.exit(1);
  });

function build() {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }

      return resolve({
        stats,
      });
    });
  });
}
