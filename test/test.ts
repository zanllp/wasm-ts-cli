import { createNewNodeApp, playgroundDir, joinPath, changeNodeApp } from '../src';
import { initCppFile, initTsFile, initTsDeclearFile, buildCppFile, packageJson } from '../src/code';
import { execSync } from 'child_process';
import * as fs from 'fs';
import { assert } from 'chai';

describe.skip('模拟32位项目的创建编译运行', function () {
    before(function () {
        execSync(`
            yarn clean
            mkdir ${playgroundDir}
        `);
    });

    this.timeout(1000 * 60 * 60);
    it('安装项目', async function () {
        this.timeout(1000 * 60 * 60);
        await createNewNodeApp({ target: 32, name: playgroundDir, action: '新建wasm-node应用' });
        const installCPPFile = fs.readFileSync(joinPath('src', 'main.cpp')).toString();
        assert(installCPPFile === initCppFile, 'cpp文件不存在');
        const installDTSFile = fs.readFileSync(joinPath('src', 'main.d.ts')).toString();
        assert(installDTSFile === initTsDeclearFile, 'ts声明文件不存在');
        const installTSFile = fs.readFileSync(joinPath('src', 'index.ts')).toString();
        assert(installTSFile === initTsFile, 'ts文件不存在');
        const installBuildCPPFIle = fs.readFileSync(joinPath('build-cpp.sh')).toString();
        assert(installBuildCPPFIle === buildCppFile, 'cpp编译配置文件不存在');
    });
    it('编译运行', async function () {
        execSync(`
            cd ${playgroundDir}
            yarn start
        `);
    });
    after(function () {
        execSync('yarn clean');
    });
});

describe('模拟32位项目修改现有node应用的创建编译运行', function () {
    before(function () {
        execSync(`
            yarn clean
            mkdir ${playgroundDir}
        `);
        fs.writeFileSync(joinPath('package.json'), fs.readFileSync('package.json'));
    });

    this.timeout(1000 * 60 * 60);
    it('安装项目', async function () {
        this.timeout(1000 * 60 * 60);
        await changeNodeApp({ target: 32, name: playgroundDir, action: '修改现有node应用' });
        const installCPPFile = fs.readFileSync(joinPath('src', 'main.cpp')).toString();
        assert(installCPPFile === initCppFile, 'cpp文件不存在');
        const installDTSFile = fs.readFileSync(joinPath('src', 'main.d.ts')).toString();
        assert(installDTSFile === initTsDeclearFile, 'ts声明文件不存在');
        const installTSFile = fs.readFileSync(joinPath('src', 'wasm-index.ts')).toString();
        assert(installTSFile === initTsFile, 'ts文件不存在');
        const installBuildCPPFIle = fs.readFileSync(joinPath('build-cpp.sh')).toString();
        assert(installBuildCPPFIle === buildCppFile, 'cpp编译配置文件不存在');
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