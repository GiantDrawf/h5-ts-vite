# H5 typescript starter

base typescript 的前端 React 应用开发启动包

## 特性

- 开发环境 vite 支持
- typescript 支持
- 支持 react hooks ，推荐使用
- 支持 sass、less，自行选择使用，demo 统一用的 sass，可修改删除
- 支持 css modules，请参考示例页面
- unstated-next，对 React context 的封装，推荐用来做全局状态共享

## 编码规范

- 类名建议使用[BEM 规范](https://github.com/Tencent/tmt-workflow/wiki/%E2%92%9B-%5B%E8%A7%84%E8%8C%83%5D--CSS-BEM-%E4%B9%A6%E5%86%99%E8%A7%84%E8%8C%83)
- 用到了 eslint 检测 js 代码，校验规则请参考 `.eslintrc` 文件，未做强制校验，可结合 vscode 安装 eslint 插件使用，然后利用编辑器提示错误并自动修复
- 有考虑未来引入 stylelint 校验样式文件

## 开发调试

本项目可以运行以下 npm 命令

### `npm start`

该命令用于开发环境构建并监听输出 dist 目录，请结合使用 charles 将页面路径映射到 dist 目录进行调试

### `npm run dev:vite`

该命令用于开发环境使用 vite 构建并起开发服务器

### `npm run build-local`

用于本地生产环境构建，带打包分析功能， 建议在提测后运行下该命令分析优化当前包内容

### `npm run build`

用于线上环境的构建
