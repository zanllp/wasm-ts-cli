import { initCppFile, initTsFile, initTsDeclearFile, wasmConfigFile } from '../src/code';
import { execSync } from 'child_process';
import * as fs from 'fs';
import { assert } from 'chai';
import { playgroundDir, joinPath } from '../src/util';
import { changeNodeApp, createNewNodeApp } from '../src/init';

describe('模拟32位项目的创建编译运行', function () {
    this.timeout(1000 * 60 * 60);
    before(function () {
        execSync(`
            yarn clean
            NODE_ENV=development yarn build
            mkdir ${playgroundDir}
        `);
    });
    it.skip('安装项目', async function () {
        await createNewNodeApp({ target: 32, name: playgroundDir, action: '新建wasm-node应用' });
        const installCPPFile = fs.readFileSync(joinPath('src', 'main.cpp')).toString();
        assert(installCPPFile === initCppFile, 'cpp文件不存在');
        const installDTSFile = fs.readFileSync(joinPath('src', 'main.d.ts')).toString();
        assert(installDTSFile === initTsDeclearFile, 'ts声明文件不存在');
        const installTSFile = fs.readFileSync(joinPath('src', 'index.ts')).toString();
        assert(installTSFile === initTsFile, 'ts文件不存在');
        const installBuildFIle = fs.readFileSync(joinPath('wasm-ts.config.js')).toString();
        assert(installBuildFIle === wasmConfigFile, '编译配置文件不存在');
    });
    it('编译运行', async function () {
        execSync(`
            top
        `,{
            cwd: playgroundDir
        })
    });
    after(function () {
        // execSync('yarn clean');
    });
});

describe('模拟32位项目修改现有node应用的创建编译运行', function () {

    this.timeout(1000 * 60 * 60);
    before(function () {
        execSync(`
            yarn clean
            NODE_ENV=development  yarn build
            mkdir ${playgroundDir}
        `);
        fs.writeFileSync(joinPath('package.json'), fs.readFileSync('package.json'));
    });
    it('安装项目', async function () {
        await changeNodeApp({ target: 32, name: playgroundDir, action: '修改现有node应用' });
        const installCPPFile = fs.readFileSync(joinPath('src', 'main.cpp')).toString();
        assert(installCPPFile === initCppFile, 'cpp文件不存在');
        const installDTSFile = fs.readFileSync(joinPath('src', 'main.d.ts')).toString();
        assert(installDTSFile === initTsDeclearFile, 'ts声明文件不存在');
        const installTSFile = fs.readFileSync(joinPath('src', 'wasm-index.ts')).toString();
        assert(installTSFile === initTsFile, 'ts文件不存在');
        const installBuildFIle = fs.readFileSync(joinPath('wasm-ts.config.js')).toString();
        assert(installBuildFIle === wasmConfigFile, '编译配置文件不存在');
        const packageJsonObj = JSON.parse(fs.readFileSync(joinPath('package.json')).toString());
        const wasmAddKey = ['wasm-start', 'wasm-start-ts', 'wasm-build-cpp'];
        assert(wasmAddKey.every(key => key in packageJsonObj.scripts), '没添加npm script');
    });
    it('编译运行', async function () {
        execSync(`
            cd ${playgroundDir}
            yarn wasm-start
        `);
    });
    after(function () {
        execSync('yarn clean');
    });
});