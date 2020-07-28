![](https://img.shields.io/npm/v/wasm-ts-cli.svg)
[![install size](https://packagephobia.com/badge?p=wasm-ts-cli)](https://packagephobia.com/result?p=wasm-ts-cli)
![](https://github.com/zanllp/wasm-ts-cli/workflows/build/badge.svg)
![](https://github.com/zanllp/wasm-ts-cli/workflows/ci/badge.svg)

# wasm-ts-cli
创建开箱即用的TypeScript-Cpp-WASM应用
# 用法 
按下面步骤会创建最基本的hello world，演示了函数调用及传参。

安装clang，node，yarn。然后

`yarn global add wasm-ts-cli`

然后
### 新建项目
```sh
mkdir wasm-example
cd wasm-example 
wasm-ts-cli # 跟随cli进行项目初始化信息输入
yarn start
```
### 修改现有项目
```sh
cd wasm-example // 移动至项目根目录下
wasm-ts-cli # 跟随cli进行项目初始化信息输入
yarn wasm-start
```
# todo
* 支持直接修改现有的项目，包括但不限于node，react，vue
* 完善test
* 增加对window平台下的支持
* 增加rust支持
