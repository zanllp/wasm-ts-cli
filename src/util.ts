import { ChildProcess } from 'child_process';
import { TEST } from '.';
import { ui as UI } from 'inquirer';
import BottomBar from 'inquirer/lib/ui/bottom-bar';

export const waitCurrCmdEndShowLoader = (cmd: ChildProcess) => {
    let ui: BottomBar;
    if (!TEST) {
        const loader = [
            '/ Installing',
            '| Installing',
            '\\ Installing',
            '- Installing',
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
            ui && ui.updateBottomBar('Installation done!\n');
            resolve();
        });
    });
};
