import { TextDocument, workspace } from 'vscode';


type TextDocumentFormatter = (textDocument: TextDocument) => Promise<string>;

export const createTextDocumentFormatter: (createFormatter: (textDocument: TextDocument) => (content: string) => Promise<string>) => TextDocumentFormatter =
    (createFormatter) => (textDocument) => createFormatter(textDocument)(textDocument.getText());
