#!/usr/bin/env node

import { exec, execSync } from 'child_process';
import { prompt } from 'inquirer';
import * as path from 'path';
import * as fs from 'fs';
import * as process from 'process';
import {
  packageJson, initTsDeclearFile, initCppFile, initTsFile, buildCppFile, changePackageJson
} from './code';
import { waitCurrCmdEndShowLoader } from './util';
export const DEV = process.env.NODE_ENV === 'development';
export const TEST = !!process.env.NODE_TEST;
export const playgroundDir = 'playground';
const startPath = DEV ? playgroundDir : '';
/**
 * 开发测试时的工作文件夹和用的时候不一样，使用这个函数获得一个统一的路径
 */
const joinPath = (...tarjoinPath: string[]) => path.join(startPath, ...tarjoinPath);
type actionType = '新建wasm-node应用' | '修改现有vue应用' | '修改现有node应用';
const actions: actionType[] = ['新建wasm-node应用', '修改现有node应用', '修改现有vue应用'];
const questions = [
  {
    type: 'list',
    name: 'action',
    message: '需要进行哪个操作',
    choices: actions,
    default: actions[0],
  },
  {
    type: 'input',
    name: 'name',
    message: '项目名称',
    default: path.parse(DEV ? playgroundDir : execSync('pwd').toString().trim()).name,
    when(answers: IAnswer) {
      return answers.action === '新建wasm-node应用';
    }
  },
  {
    type: 'list',
    name: 'target',
    message: '编译目标（位）',
    choices: [32, 64],
    default: 32,
  },
];
interface IAnswer {
  target: 32 | 64;
  name: string;
  action: actionType;
}
const installSDK = async (answer: IAnswer) => {
  const { target } = answer;
  const cmd = exec(
    `
        echo "安装emsdk"
        git clone https://github.com/emscripten-core/emsdk.git
        cd emsdk
        git pull
        ./emsdk install sdk-${
    target === 64 ? 'upstream-master-64bit' : 'latest'
    }
        ./emsdk activate sdk-${
    target === 64 ? 'upstream-master-64bit' : 'latest'
    }
    `,
    {
      cwd: DEV ? playgroundDir : void 0,
    }
  );
  await waitCurrCmdEndShowLoader(cmd);
};

const writeCode = (prefixe?: string) => {
  fs.writeFileSync(joinPath('src', 'main.cpp'), initCppFile);
  fs.writeFileSync(joinPath('src', prefixe ? `${prefixe}index.ts` : 'index.ts'), initTsFile);
  fs.writeFileSync(joinPath('src', 'main.d.ts'), initTsDeclearFile);
  fs.writeFileSync(joinPath('build-cpp.sh'), buildCppFile);
};

export const createNewNodeApp = async (answer: IAnswer) => {
  const { name } = answer;
  await installSDK(answer);
  fs.writeFileSync(joinPath('package.json'), packageJson(name));
  const cmd = exec(`
        echo "初始化ts"
        yarn add ts-node typescript @types/node @types/emscripten
        yarn tsc --init
        mkdir src
    `,
    {
      cwd: DEV ? playgroundDir : void 0,
    });
  await waitCurrCmdEndShowLoader(cmd);
  writeCode();
};

const changeNodeApp = async (answer: IAnswer) => {
  await installSDK(answer);
  const packagePath = joinPath('package.json');
  const packageJsonSrc = fs.readFileSync(packagePath).toString();
  const resJson = changePackageJson(packageJsonSrc);
  fs.writeFileSync(packagePath, resJson);
  const cmd = exec(`
        echo "初始化ts"
        yarn add ts-node typescript @types/node @types/emscripten
    `,
    {
      cwd: DEV ? playgroundDir : void 0,
    });
  await waitCurrCmdEndShowLoader(cmd);
  if (!fs.existsSync(joinPath('tsconfig.json'))) {
    execSync('yarn tsc --init');
  }
  if (!fs.existsSync(joinPath('src'))) {
    execSync('mkdir src');
  }
  writeCode('wasm-');
};

Promise.resolve().then(async () => {
  if (DEV && !TEST) {
    console.log(`开发\\测试时在${playgroundDir}文件夹下`);
    execSync(`mkdir ${playgroundDir}`);
  }
  if (!TEST) {
    const answer = await prompt(questions) as IAnswer;
    try {
      let startScript = 'start';
      switch (answer.action) {
        case '新建wasm-node应用':
          await createNewNodeApp(answer);
          break;
        case '修改现有node应用':
          await changeNodeApp(answer);
          startScript = 'wasm-start';
          break;
        default:
          throw new RangeError('不支持的行为');
      }
      console.log(`\n安装完成！尝试 yarn ${startScript}`);
    } catch (error) {
      console.error(error);
      process.exit();
    }
    process.exit();
  }
});



