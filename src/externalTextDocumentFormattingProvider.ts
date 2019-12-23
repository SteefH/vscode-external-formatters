import * as vscode from 'vscode';
import { createFormattingProvider } from './documentFormattingEditProvider';
import * as tdf from './textDocumentFormatter';
import * as etf from './externalTextFormatter';
import * as path from 'path';
import * as process from 'process';

export const create: () => vscode.DocumentFormattingEditProvider = () =>
    createFormattingProvider(() =>
        tdf.createTextDocumentFormatter((td) =>
            etf.externalTextFormatter(getSettingsForDocument(td))
        )
    );

export interface ExternalFormatterSettings {
    command: string;
    arguments: string[];
}


const getSettingsForDocument: (doc: vscode.TextDocument) => etf.FormatterSettings =
    (doc) => {
        const config = vscode.workspace.getConfiguration('externalFormatters');
        const forLanguage = config.get<ExternalFormatterSettings>(doc.languageId);

        if (!forLanguage) {
            throw new Error(`Invalid settings for "externalFormatters.${doc.languageId}"`);
        }
        return {
            command: forLanguage.command,
            args: forLanguage.arguments,
            workDir: documentDir(doc) || rootFolder() || process.cwd()
        };
    };

const rootFolder = () => vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath;

const documentDir: (td: vscode.TextDocument) => string | undefined = (textDocument: vscode.TextDocument) => {
    if (textDocument.uri.scheme !== 'file') { return; }
    return path.dirname(textDocument.uri.fsPath);
};
