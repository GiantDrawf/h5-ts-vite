/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-07-27 16:25:27
 * @LastEditors: zhujian
 * @LastEditTime: 2021-09-26 11:26:36
 * @Description: 你 kin 你擦
 */

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const fs = require('fs-extra');
const detect = require('detect-port');
const configFactory = require('../config/webpack.config');
const paths = require('../config/paths');

const config = configFactory('development');
const compiler = webpack(config);

const DEFAULT_PORT = 3000;
const HOST = '0.0.0.0';

detect(DEFAULT_PORT, HOST)
  .then((port) => {
    if (DEFAULT_PORT !== port) {
      console.log(`端口：${DEFAULT_PORT} 已被占用，为您更换成：${port}`);
    }
    const devServer = new WebpackDevServer(compiler, {
      // contentBase: paths.appPublic,
      // publicPath: paths.servedPath,
      // TODO: live reload 配置，试验阶段，还有点问题
      // sockPort: DEFAULT_PORT,
      // sockHost: HOST,
      // disableHostCheck: true
    });

    // Launch WebpackDevServer.
    devServer.listen(port, HOST, (err) => {
      if (err) {
        return console.log(err);
      }
    });
  })
  .catch((err) => {
    console.error(err);
  });
