import { ChildProcess } from 'child_process';
import { ui as UI } from 'inquirer';
import BottomBar from 'inquirer/lib/ui/bottom-bar';
import path from 'path';

export const waitCurrCmdEndShowLoader = (cmd: ChildProcess) => {
    let ui: BottomBar;
    if (!TEST) {
        const loader = [
            '/ 安装中',
            '| 安装中',
            '\\ 安装中',
            '- 安装中',
        ];
        let i = 4;
        ui = new UI.BottomBar({ bottomBar: loader[i % 4] });
        setInterval(() => {
            ui.updateBottomBar(loader[i++ % 4]);
        }, 300);
        cmd.stdout!.pipe(ui.log);
    }
    return new Promise((resolve) => {
        cmd.on('close', () => {
            // tslint:disable-next-line:no-unused-expression
            ui && ui.updateBottomBar('安装完成!\n');
            resolve();
        });
    });
};

export const DEV = process.env.NODE_ENV === 'development';
export const TEST = !!process.env.NODE_TEST;
export const playgroundDir = 'playground';
export const startPath = DEV ? playgroundDir : '';
/**
 * 开发测试时的工作文件夹和用的时候不一样，使用这个函数获得一个统一的路径
 */
export const joinPath = (...tarjoinPath: string[]) => path.join(startPath, ...tarjoinPath);