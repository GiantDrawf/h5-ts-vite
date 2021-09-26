/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-07-27 16:25:27
 * @LastEditors: zhujian
 * @LastEditTime: 2021-09-26 11:41:57
 * @Description: 你 kin 你擦
 */
/* eslint-disable */
import vitePluginReactJsSupport from 'vite-plugin-react-js-support';
import reactRefresh from '@vitejs/plugin-react-refresh';
import legacyPlugin from '@vitejs/plugin-legacy';
import path from 'path';
import pkg from './package.json';

// https://cn.vitejs.dev/config/
export default ({ command, mode }) => {
  let rollupOptions = {};
  if (command === 'serve') {
    rollupOptions.input = [];
  }

  let optimizeDeps = {};
  if (command === 'serve') {
    optimizeDeps.entries = false;
  }

  let alias = {
    '@': path.resolve(__dirname, 'src'),
  };

  let proxy = {};

  let esbuild = {};

  return {
    base: `/${pkg.name}/`,
    root: './', // js导入的资源路径，src
    resolve: {
      alias,
    },
    define: {
      'process.env.APP_IS_LOCAL': '"true"',
    },
    server: {
      host: '0.0.0.0',
      // 代理
      proxy,
      hmr: {
        host: 'localhost',
      },
      cors: true,
    },
    build: {
      target: 'es2015',
      minify: 'terser', // 是否进行压缩,boolean | 'terser' | 'esbuild',默认使用terser
      manifest: false, // 是否产出maifest.json
      sourcemap: false, // 是否产出soucemap.json
      outDir: 'build', // 产出目录
      rollupOptions,
    },
    esbuild,
    optimizeDeps,
    css: {
      preprocessorOptions: {
        less: {
          // 支持内联 JavaScript
          javascriptEnabled: true,
          modifyVars: {
            'brand-color': '#E02736',
          },
        },
      },
    },
    plugins: [
      vitePluginReactJsSupport([], { jsxInject: false }),
      reactRefresh(),
      legacyPlugin({
        targets: [
          'Android > 39',
          'Chrome >= 60',
          'Safari >= 10.1',
          'iOS >= 10.3',
          'Firefox >= 54',
          'Edge >= 15',
        ],
      }),
    ],
  };
};
