const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackNoModulePlugin =
  require('webpack-nomodule-plugin').WebpackNoModulePlugin;
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const fs = require('fs');
const path = require('path');

const paths = require('./paths');
const pkg = require('../package.json');

const getVersion = () => {
  const versionFile = path.resolve(__dirname, '../VERSION');
  const content = fs.readFileSync(versionFile, { encoding: 'utf8' });
  return content.trim();
};

const localIdentName = '[local]--[hash:base64:5]';

// style files regexes
const cssRegex = /\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

module.exports = function (webpackEnv) {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';

  // Webpack uses `publicPath` to determine where the app is being served from.
  // It requires a trailing slash, or the file assets will get an incorrect path.
  // 开发环境，使用相对路径，以便使用 charles 进行 map 调试
  const publicPath = isEnvProduction
    ? paths.servedPath
    : isEnvDevelopment && '';
  // Some apps do not use client-side routing with pushState.
  // For these, "homepage" can be set to "." to enable relative asset paths.
  const shouldUseRelativeAssetPaths = publicPath === './';

  // common function to get style loaders
  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isEnvDevelopment && require.resolve('style-loader'),
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        options: Object.assign(
          {},
          shouldUseRelativeAssetPaths ? { publicPath: '../../' } : undefined
        ),
      },
      // 解析 @import 和 url()
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: require.resolve('postcss-loader'),
        options: {
          postcssOptions: {
            plugins: [
              require('postcss-flexbugs-fixes'),
              require('postcss-preset-env')({
                autoprefixer: {
                  overrideBrowserslist: 'android >= 4.3',
                  // flexbox: 'no-2009'
                },
                stage: 3,
              }),
              require('postcss-plugin-px2rem')({
                rootValue: 75,
                minPixelValue: 2,
              }),
            ],
          },
          sourceMap: isEnvProduction,
        },
      },
    ].filter(Boolean);
    if (preProcessor) {
      loaders.push({
        loader: require.resolve(preProcessor),
        options: {
          sourceMap: isEnvProduction,
          ...(preProcessor === 'less-loader'
            ? {
                lessOptions: {
                  modifyVars: {
                    'brand-color': '#E02736',
                  },
                },
              }
            : void 0),
        },
      });
    }
    return loaders;
  };

  return {
    mode: (isEnvDevelopment && 'development') || 'production',
    devtool: isEnvDevelopment && 'cheap-module-source-map',
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    entry: {
      polyfill: paths.appPolyfill,
      main: paths.appIndexJs,
    },
    output: {
      path: paths.appBuild,
      publicPath: publicPath,
      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      filename:
        (isEnvProduction && 'static/js/[name].[contenthash:8].js') ||
        'static/js/[name].bundle.js',
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename:
        (isEnvProduction && 'static/js/[name].[contenthash:8].chunk.js') ||
        'static/js/[name].chunk.js',
    },
    optimization: {
      minimize: isEnvProduction,
      minimizer: [new TerserPlugin(), new OptimizeCssAssetsPlugin()],
      // Automatically split vendor and commons
      // https://twitter.com/wSokra/status/969633336732905474
      // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
      splitChunks: {
        chunks(chunk) {
          // exclude `polyfill`
          return chunk.name !== 'polyfill';
        },
        name: false,
        cacheGroups: {
          css: {
            name: 'css',
            test: /\.(scss|sass|css|less)$/,
            chunks: 'all',
            enforce: true,
            priority: 10,
          },
          defaultVendors: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            enforce: true,
            priority: 20,
          },
        },
      },
      // The value "single" instead creates a runtime file to be shared for all generated chunks.
      runtimeChunk: 'single',
    },
    module: {
      rules: [
        {
          // "oneOf" will traverse all following loaders until one will
          // match the requirements. When no loader matches it will fall
          // back to the "file" loader at the end of the loader list.
          oneOf: [
            // "url" loader works like "file" loader except that it embeds assets
            // smaller than specified limit in bytes as data URLs to avoid requests.
            // A missing `test` is equivalent to a match.
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: 2048,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // Process application JS with Babel.
            // The preset includes JSX, Flow, TypeScript, and some ESnext features.
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: paths.appSrc,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                customize: require.resolve(
                  'babel-preset-react-app/webpack-overrides'
                ),
                presets: ['react-app'],
                plugins: [],
                // This is a feature of `babel-loader` for webpack (not Babel itself).
                // It enables caching results in ./node_modules/.cache/babel-loader/
                // directory for faster rebuilds.
                cacheDirectory: true,
                cacheCompression: isEnvProduction,
                compact: isEnvProduction,
              },
            },
            // Process any JS outside of the app with Babel.
            // Unlike the application JS, we only compile the standard ES features.
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve('babel-preset-react-app/dependencies'),
                    { helpers: true },
                  ],
                ],
                cacheDirectory: true,
                cacheCompression: isEnvProduction,

                // If an error happens in a package, it's possible to be
                // because it was compiled. Thus, we don't want the browser
                // debugger to show the original code. Instead, the code
                // being evaluated would be much more helpful.
                sourceMaps: false,
              },
            },
            // "postcss" loader applies autoprefixer to our CSS.
            // "css" loader resolves paths in CSS and adds assets as dependencies.
            // "style" loader turns CSS into JS modules that inject <style> tags.
            // In production, we use MiniCSSExtractPlugin to extract that CSS
            // to a file, but in development "style" loader enables hot editing
            // of CSS.
            {
              test: cssRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction,
              }),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            // Opt-in support for SASS (using .scss or .sass extensions).
            // By default we support SASS Modules with the
            // extensions .module.scss or .module.sass
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: isEnvProduction,
                },
                'sass-loader'
              ),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            {
              test: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: isEnvProduction,
                  modules: {
                    localIdentName,
                  },
                },
                'sass-loader'
              ),
              sideEffects: true,
            },
            {
              test: lessRegex,
              exclude: lessModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: isEnvProduction,
                },
                'less-loader'
              ),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            {
              test: lessModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: isEnvProduction,
                  modules: {
                    localIdentName,
                  },
                },
                'less-loader'
              ),
              sideEffects: true,
            },
            // "file" loader makes sure those assets get served by WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
              loader: require.resolve('file-loader'),
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/, /^$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
          ],
        },
      ],
    },
    resolve: {
      extensions: paths.moduleFileExtensions.map((ext) => `.${ext}`),
      alias: {
        '@': paths.appSrc,
      },
    },
    plugins: [
      process.env.analyz &&
        new BundleAnalyzerPlugin({
          analyzerMode: 'disabled',
          generateStatsFile: true,
        }),
      // 生成 `index.html` 并注入 <script>
      new HtmlWebpackPlugin({
        template: paths.appHtml,
        minify: isEnvProduction
          ? {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            }
          : false,
      }),
      new WebpackNoModulePlugin({
        filePatterns: ['{./,}**/*polyfill.**.js'],
      }),
      // 提取css到单独的文件
      isEnvProduction &&
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
    ].filter(Boolean),
  };
};
