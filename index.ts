import { JumpFm } from 'jumpfm-api'

import * as mv from 'mv';
import * as fs from 'fs-extra';
import * as cmd from 'node-cmd';
import * as path from 'path';



export const load = (jumpFm: JumpFm) => {
    const dialog = jumpFm.dialog
    const clipboard = jumpFm.electron.clipboard
    const shell = jumpFm.electron.shell

    jumpFm.panels.forEach(panel => {
        panel.bind('del', ['del'], () => {
            console.log('del')
            panel.getSelectedItems().forEach(item => {
                fs.remove(item.path)
            })
        })

        panel.bind('edit', ['f4'], () => {
            const cmdStr =
                `${jumpFm.settings.getStr('editor', 'gedit')} "${panel.getCurrentItem().path}"`

            console.log(cmdStr)
            cmd.run(cmdStr)
        })

        panel.bind('newFile', ['shift+f4'], () => {
            const pwd = panel.getUrl().path
            jumpFm.dialog.open({
                label: 'New File',
                onOpen: input => {
                    input.value = 'untitled.txt'
                    input.select();
                },
                onAccept: name => {
                    const f = path.join(pwd, name)
                    fs.closeSync(fs.openSync(f, 'a'))
                    shell.openItem(f)
                }
            })
        })

        panel.bind('rename', ['f2'], () => {
            dialog.open({
                label: 'Rename',
                onOpen: input => {
                    console.log('open', input)
                    const name = panel.getCurrentItem().name
                    input.value = name
                    input.select()
                    input.setSelectionRange(0, name.length - path.extname(name).length);
                },
                onAccept: name => {
                    fs.renameSync(
                        panel.getCurrentItem().path,
                        path.join(panel.getUrl().path, name)
                    )
                },
            })
        })

        panel.bind('newFolder', ['f7'], () => {
            dialog.open({
                label: 'New Folder',
                onOpen: input => {
                    input.value = 'New Folder'
                    input.select()
                },
                onAccept: name => {
                    fs.mkdirSync(
                        path.join(panel.getUrl().path, name)
                    )
                },
            })
        })

        panel.bind('move', ['f6'], () => {
            panel.getSelectedItems().forEach(file =>
                mv(
                    file.path
                    , path.join(jumpFm.getPanelPassive().getUrl().path, file.name)
                    , err => console.log(err)
                )
            )
        })

        const copy = (txt) => {
            clipboard.writeText(txt)
            jumpFm.statusBar.msg('clipboard')
                .setType('info')
                .setText('Copied to Clipboard')
                .setTooltip(txt)
                .setClearTimeout(6000)
        }

        panel.bind('copyFilePath', ['p'], () => {
            copy(panel.getCurrentItem().path)
        })

        panel.bind('copyDirPath', ['shift+p'], () => {
            copy(panel.getUrl().path)
        })
    })
}
