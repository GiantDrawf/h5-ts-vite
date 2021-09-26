/**
 * 关于构建用到的路径配置
 */
const fs = require('fs');
const path = require('path');
const url = require('url');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

function ensureSlash(inputPath, needsSlash) {
  const hasSlash = inputPath.endsWith('/');
  if (hasSlash && !needsSlash) {
    return inputPath.substr(0, inputPath.length - 1);
  } else if (!hasSlash && needsSlash) {
    return `${inputPath}/`;
  } else {
    return inputPath;
  }
}

const getPublicUrl = appPackageJson => require(appPackageJson).homepage;

// 根据 homepage 计算出 web 服务路径
// 未配置 homepage 则默认是根路径 '/'
function getServedPath(appPackageJson) {
  const publicUrl = getPublicUrl(appPackageJson);
  const servedUrl = publicUrl ? url.parse(publicUrl).pathname : '/';
  return ensureSlash(servedUrl, true);
}

const moduleFileExtensions = [
  'js',
  'ts',
  'tsx',
  'json',
  'jsx',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

module.exports = {
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveModule(resolveApp, 'src/index'),
  appPolyfill: resolveModule(resolveApp, 'src/polyfill'),
  appBuild: resolveApp('dist'),
  appSrc: resolveApp('src'),
  publicUrl: getPublicUrl(resolveApp('package.json')),
  servedPath: getServedPath(resolveApp('package.json')),
};

module.exports.moduleFileExtensions = moduleFileExtensions;
