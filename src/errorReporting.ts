import * as vscode from 'vscode';
import { ExternalTextFormatterError } from './externalTextFormatter';

const divider = `\n${'='.repeat(80)}\n`;
const crNotFollowedByLfOrLfNotPrecededByCr = /(\r(?!\n)|(?<!\r)\n)/g;

export const reportError: (e: any) => Promise<void> =
    async (e) => {
        if (e instanceof ExternalTextFormatterError) {
            const message = `External formatter "${[e.command, ...e.arguments].join(' ')}" exited with code ${e.exitCode}.`;
            if (await vscode.window.showErrorMessage(message, 'Show output in terminal')) {
                showInTerminal(
                    message +
                    '\nstderr is shown below:\n' +
                    divider +
                    e.stderr +
                    divider +
                    '\nPress any key to close this terminal' +
                    '\x1b[?25l' // escape sequence to hide cursor
                );
            }
        } else {
            await vscode.window.showErrorMessage(`${e}`);
        }
    };

const showInTerminal: (output: string) => void =
    output => {
        const outputEmitter = new vscode.EventEmitter<string>();
        const terminal = vscode.window.createTerminal({
            name: 'External formatter error',
            pty: {
                open: () => outputEmitter.fire(output.replace(crNotFollowedByLfOrLfNotPrecededByCr, '\r\n')),
                close: () => terminal.dispose(),
                onDidWrite: outputEmitter.event,
                handleInput: () => terminal.dispose()
            }
        });
        terminal.show();
    };
