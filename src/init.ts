import { playgroundDir, DEV, waitCurrCmdEndShowLoader, joinPath } from './util';
import { execSync, exec } from 'child_process';
import * as fs from 'fs';
import { changePackageJson, buildCppFile, initTsFile, initCppFile, initTsDeclearFile, packageJson } from './code';
import { prompt } from 'inquirer';
import path from 'path';

export const createNewNodeApp = async (answer: IAnswer) => {
    const { name } = answer;
    await installSDK(answer);
    fs.writeFileSync(joinPath('package.json'), packageJson(name));
    const cmd = exec(`
          echo "初始化ts"
          yarn add ts-node typescript @types/node @types/emscripten --dev
          yarn tsc --init
          mkdir src
      `,
        {
            cwd: DEV ? playgroundDir : void 0,
        });
    await waitCurrCmdEndShowLoader(cmd);
    writeCode();
};

export const changeNodeApp = async (answer: IAnswer) => {
    await installSDK(answer);
    const packagePath = joinPath('package.json');
    const packageJsonSrc = fs.readFileSync(packagePath).toString();
    const resJson = changePackageJson(packageJsonSrc);
    fs.writeFileSync(packagePath, resJson);
    const cmd = exec(`
          echo "初始化ts"
          yarn add ts-node typescript @types/node @types/emscripten --dev
      `,
        {
            cwd: DEV ? playgroundDir : void 0,
        });
    await waitCurrCmdEndShowLoader(cmd);
    if (!fs.existsSync(joinPath('tsconfig.json'))) {
        execSync('yarn tsc --init');
    }
    if (!fs.existsSync(joinPath('src'))) {
        execSync(`mkdir ${joinPath('src')}`);
    }
    writeCode('wasm-');
};

export const installSDK = async (answer: IAnswer) => {
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

export const writeCode = (prefixe?: string) => {
    fs.writeFileSync(joinPath('src', 'main.cpp'), initCppFile);
    fs.writeFileSync(joinPath('src', prefixe ? `${prefixe}index.ts` : 'index.ts'), initTsFile);
    fs.writeFileSync(joinPath('src', 'main.d.ts'), initTsDeclearFile);
    fs.writeFileSync(joinPath('build-cpp.sh'), buildCppFile);
};

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

export interface IAnswer {
  target: 32 | 64;
  name: string;
  action: actionType;
}

export const init = async () => {
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
};