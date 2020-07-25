#!/usr/bin/env node

import { exec, ChildProcess, execSync } from 'child_process';
import { prompt, ui as UI } from 'inquirer';
import * as path from 'path';
import * as fs from 'fs';
import * as process from 'process';
const dev = process.env.NODE_ENV === 'development';
const playgroundDir = 'playground';
const questions = [
  {
    type: 'input',
    name: 'name',
    message: '项目名称',
    default: path.parse(dev ? playgroundDir : execSync('pwd').toString().trim())
      .name,
  },
  {
    type: 'list',
    name: 'target',
    message: '编译目标（位）',
    choices: [32, 64],
    default: 32,
  },
];
Promise.resolve().then(async () => {
  if (dev) {
    console.log(`开发时在${playgroundDir}文件夹下`);
    execSync(`mkdir ${playgroundDir}`);
  }
  const { target, name } = (await prompt(questions)) as {
    target: 32 | 64;
    name: string;
  };
  let cmd = exec(
    `
        echo "安装emsdk"
        git clone https://github.com/emscripten-core/emsdk.git
        cd emsdk
        git pull
        ./emsdk install ${
          target === 64 ? 'sdk-upstream-master-64bit' : 'latest'
        }
        ./emsdk activate ${
          target === 64 ? 'sdk-upstream-master-64bit' : 'latest'
        }
    `,
    {
      cwd: dev ? playgroundDir : void 0,
    }
  );
  const startPath = dev ? playgroundDir : '';
  await waitCurrCmdEnd(cmd);
  fs.writeFileSync(path.join(startPath,'package.json'), packageJson(name));
  cmd = exec(`
        echo "初始化ts"
        yarn add ts-node typescript @types/node @types/emscripten
        yarn tsc --init
        mkdir src
    `,
    {
      cwd: dev ? playgroundDir : void 0,
    });
  await waitCurrCmdEnd(cmd);
  fs.writeFileSync(path.join(startPath,'src', 'main.cpp'), initCppFile);
  fs.writeFileSync(path.join(startPath,'src', 'index.ts'), initTsFile);
  fs.writeFileSync(path.join(startPath,'src', 'main.d.ts'), initTsDeclearFile);
  fs.writeFileSync(path.join(startPath,'build-cpp.sh'), buildCppFile);
  console.log();
  console.log('安装完成！尝试 yarn start');
  process.exit();
});

const waitCurrCmdEnd = (cmd: ChildProcess) => {
  const loader = [
    '/ Installing',
    '| Installing',
    '\\ Installing',
    '- Installing',
  ];
  let i = 4;
  const ui = new UI.BottomBar({ bottomBar: loader[i % 4] });
  setInterval(() => {
    ui.updateBottomBar(loader[i++ % 4]);
  }, 300);
  cmd.stdout!.pipe(ui.log);
  return new Promise((resolve) => {
    cmd.on('close', () => {
      resolve();
    });
  });
};

const packageJson = (name: string) =>
  JSON.stringify(
    {
      name,
      version: '1.0.0',
      main: 'index.js',
      license: 'MIT',
      devDependencies: {},
      scripts: {
        start: 'yarn build-cpp && yarn start-ts',
        'start-ts': 'ts-node src/index.ts',
        'build-cpp': 'chmod 777 build-cpp.sh && ./build-cpp.sh',
      },
      dependencies: {},
    },
    null,
    4
  );

const initTsFile = `
import Module, { modType } from './main';
const fetchModule = Module;
let m: modType;

Promise.resolve().then(async () => {
    m = await fetchModule();

    const result = m.ccall('add_one', // name of C function
        'number', // return type
        ['number'], // argument types
        [10]);
    console.log(\`10 + 1 resuelt:\${result}\`);
    console.log('lerp result: ' + m.lerp(1, 2, 0.5));
});
`;
const initTsDeclearFile = `
import 'emscripten';
export type modType = EmscriptenModule & {
    cwrap: typeof cwrap,
    ccall: typeof ccall,
    lerp: (a:number,b:number,c:number)=>number,
};
declare const Module : () => Promise<modType>;
export default Module;
`;
const initCppFile = `
#include <iostream>
#include <emscripten/bind.h>

#include <emscripten.h>
using namespace std;
using namespace emscripten;

float lerp(float a, float b, float t)
{
    return (1 - t) * a + t * b;
}


EMSCRIPTEN_BINDINGS(my_module)
{
    emscripten::function("lerp", &lerp);
}

extern "C"
{

    int add_one(int a)
    {
        return a + 1;
    }
}
`;

const buildCppFile = `
cd emsdk
. ./emsdk_env.sh
cd ../
em++ -o3 src/main.cpp \\
--bind \\
-std=c++17 \\
-s MODULARIZE \\
-s ALLOW_MEMORY_GROWTH=1 \\
-s EXPORTED_FUNCTIONS='["_add_one"]' \\
-s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap", "ccall"]' \\
-o src/main.js

echo "compiled"

`;
