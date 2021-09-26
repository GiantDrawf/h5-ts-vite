/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-07-27 16:25:27
 * @LastEditors: zhujian
 * @LastEditTime: 2021-09-26 14:36:39
 * @Description: 你 kin 你擦
 */
module.exports = {
  plugins: [
    require('postcss-flexbugs-fixes'),
    require('postcss-preset-env')({
      autoprefixer: {
        overrideBrowserslist: 'android >= 4.3',
      },
      stage: 3,
    }),
    require('postcss-plugin-px2rem')({
      rootValue: 75,
      minPixelValue: 2,
    }),
  ],
};
