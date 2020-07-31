#!/usr/bin/env node
import { program } from 'commander';
import { execSync } from 'child_process';
import * as fs from 'fs';
import { playgroundDir, DEV, TEST } from './util';
import { init } from './init';
import { IConfig, createCompilerCommand } from './code';
import { cwd } from 'process';
import * as path from 'path';

program
  .version(JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString()).version)
  .option('-i, --init', '初始化工程，创建新项目或改造现有的项目')
  .option('-c, --compiler', '根据配置文件编译c++到wasm和js')
  .option('-s, --start', '根据配置文件启动（一般是ts，没有也无所谓）')
  .parse(process.argv);


Promise.resolve().then(async () => {
  if (TEST) {
    return;
  }
  if (DEV) {
    console.log(`开发\\测试时在${playgroundDir}文件夹下`);
    execSync(`mkdir ${playgroundDir}`);
  }
  if (program.init) {
    await init();
  } else if (program.compiler) {
    const configFileName = 'wasm-ts.config.js';
    if (!fs.existsSync(configFileName)) {
      throw new RangeError('该目录下找不到配置文件！！！');
    }
    const compilerParams = require(path.join(cwd(), configFileName)) as IConfig;
    const command = createCompilerCommand(compilerParams.cpp);
    console.log(execSync(command).toString());
    console.log('\n\n编译完成！！！');
  } else {
    program.help();
  }
}).catch(console.error);



