![](https://img.shields.io/npm/v/wasm-ts-cli.svg)
[![install size](https://packagephobia.com/badge?p=wasm-ts-cli)](https://packagephobia.com/result?p=wasm-ts-cli)
![](https://github.com/zanllp/wasm-ts-cli/workflows/build/badge.svg)

# wasm-ts-cli
快速创建ts调用c++ wasm项目原型的cli
# 用法 
按下面步骤会创建最基本的hello world，演示了函数调用及传参。

安装clang，node，yarn。然后
```sh
yarn global add wasm-ts-cli
mkdir wasm-example
cd wasm-example
wasm-ts-cli # 跟随cli进行项目初始化信息输入
yarn start
```
# todo
* 支持直接修改现有的项目，包括但不限于node，react，vue
* 完善test
* 增加对window平台下的支持
* 增加rust支持
