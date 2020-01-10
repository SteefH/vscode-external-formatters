import * as vscode from 'vscode';
import { createFormattingProvider } from './documentFormattingEditProvider';
import * as etf from './externalTextFormatter';
import * as path from 'path';
import * as process from 'process';
import * as config from './configuration';

export const create: () => vscode.DocumentFormattingEditProvider =
    () => createFormattingProvider(
        async (td) => {
            const formatter = etf.externalTextFormatter(getSettingsForDocument(td));
            return await formatter(td.getText());
        }
    );


const getSettingsForDocument: (doc: vscode.TextDocument) => etf.FormatterSettings =
    (doc) => {
        const getFormatterConfigs = config.getFormatterConfigs();
        const applicableSelectorAndConfig = getFormatterConfigs.find(([selector]) => vscode.languages.match(selector, doc) > 0);
        if (!applicableSelectorAndConfig) {
            throw new Error(`Bad settings for externalFormatters.${doc.languageId}`);
        }
        const [, { command, arguments: args }] = applicableSelectorAndConfig;

        return {
            command,
            args,
            workDir: documentDir(doc) || rootFolder() || process.cwd()
        };
    };


const rootFolder: () => string | undefined =
    () => vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;


const documentDir: (td: vscode.TextDocument) => string | undefined =
    (textDocument: vscode.TextDocument) => {
        if (textDocument.uri.scheme !== 'file') { return; }
        return path.dirname(textDocument.uri.fsPath);
    };
