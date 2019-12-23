import * as vscode from 'vscode';

type TextDocumentFormatter = (doc: vscode.TextDocument) => Promise<string>;
export const createFormattingProvider: (createTextDocumentFormatter: () => TextDocumentFormatter) => vscode.DocumentFormattingEditProvider =
    (createTextDocumentFormatter) => {
        return {
            provideDocumentFormattingEdits: async (document, _formattingOptions, _token) => {
                try {
                    const f = createTextDocumentFormatter();
                    const newContent = await f(document);
                    return textToFullDocumentReplacement(document)(newContent);
                } catch (e) {
                    console.error("Formatter failed", e);
                    vscode.window.showErrorMessage(`${e}`);
                    return null;
                }
            }
        };
    };

const textToFullDocumentReplacement: (document: vscode.TextDocument) => (text: string) => vscode.TextEdit[] =
    (document) =>
        (text) => {
            const firstLine = document.lineAt(0);
            const lastLine = document.lineAt(document.lineCount - 1);
            const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
            return [vscode.TextEdit.replace(textRange, text)];
        };
