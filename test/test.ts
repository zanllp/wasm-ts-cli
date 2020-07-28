import { createNewNodeApp, playgroundDir } from '../src';
import { initCppFile, initTsFile, initTsDeclearFile, buildCppFile } from '../src/code';
import { execSync } from 'child_process';
import * as fs from 'fs';
import { assert } from 'chai';
import path from 'path';

describe('模拟32位项目的创建编译运行', function () {
    before(function () {
        execSync(`
            yarn clean
            mkdir ${playgroundDir}
        `);
    });

    this.timeout(1000 * 60 * 60);
    it('安装项目', async function () {
        this.timeout(1000 * 60 * 60);
        await createNewNodeApp({ target: 32, name: playgroundDir, action:'新建wasm-node应用' });
        const installCPPFile = fs.readFileSync(path.join(playgroundDir, 'src', 'main.cpp')).toString();
        assert(installCPPFile === initCppFile, 'cpp文件不存在');
        const installDTSFile = fs.readFileSync(path.join(playgroundDir, 'src', 'main.d.ts')).toString();
        assert(installDTSFile === initTsDeclearFile, 'ts声明文件不存在');
        const installTSFile = fs.readFileSync(path.join(playgroundDir, 'src', 'index.ts')).toString();
        assert(installTSFile === initTsFile, 'ts文件不存在');
        const installBuildCPPFIle = fs.readFileSync(path.join(playgroundDir, 'build-cpp.sh')).toString();
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