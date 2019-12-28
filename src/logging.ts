import * as vscode from 'vscode';

const channels: {
    error: Array<vscode.OutputChannel>;
    output: Array<vscode.OutputChannel>;
} = { error: [], output: [] };

export const registerErrorChannel: (channel: vscode.OutputChannel) => vscode.Disposable =
    (channel) => {
        channels.error.push(channel);
        return new vscode.Disposable(() => {
            const index = channels.error.indexOf(channel);
            if (index > -1) {
                channels.error.splice(index, 1);
            }
        });
    };

export const registerOutputChannel: (channel: vscode.OutputChannel) => vscode.Disposable =
    (channel) => {
        channels.output.push(channel);
        return new vscode.Disposable(() => {
            const index = channels.error.indexOf(channel);
            if (index > -1) {
                channels.output.splice(index, 1);
            }
        });
    };

export const error: (message: string) => void =
    (message) => channels.error.forEach((channel) => channel.appendLine(`[ error  ] ${message}`));

export const log: (message: string) => void =
    (message) => channels.output.forEach((channel) => channel.appendLine(`[ output ] ${message}`));
