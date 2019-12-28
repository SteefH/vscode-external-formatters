import * as vscode from 'vscode';

type TextDocumentFormatter = (doc: vscode.TextDocument) => Promise<string | undefined>;

export const createFormattingProvider: (textDocumentFormatter: TextDocumentFormatter) => vscode.DocumentFormattingEditProvider =
    (textDocumentFormatter) => {
        return {
            provideDocumentFormattingEdits: async (document, _formattingOptions, _token) => {
                try {
                    const newContent = await textDocumentFormatter(document);
                    if (!newContent) {
                        return;
                    }
                    return textToFullDocumentReplacement(document, newContent);
                } catch (e) {
                    vscode.window.showErrorMessage(`${e}`);
                    return null;
                }
            }
        };
    };


const textToFullDocumentReplacement: (document: vscode.TextDocument, text: string) => vscode.TextEdit[] =
    (document, text) => {
        const firstLine = document.lineAt(0);
        const lastLine = document.lineAt(document.lineCount - 1);
        const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
        return [vscode.TextEdit.replace(textRange, text)];
    };
