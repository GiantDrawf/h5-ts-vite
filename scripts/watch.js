/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-07-27 16:25:27
 * @LastEditors: zhujian
 * @LastEditTime: 2021-09-26 11:26:52
 * @Description: 你 kin 你擦
 */

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

const webpack = require('webpack');
const fs = require('fs-extra');
const configFactory = require('../config/webpack.config');
const paths = require('../config/paths');

const config = configFactory('development', true);
const compiler = webpack(config);

fs.emptyDirSync(paths.appBuild);

compiler.watch(
  {
    aggregateTimeout: 300,
    poll: 1000,
  },
  (err, stats) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(
      stats.toString({
        colors: true,
      })
    );
  }
);
