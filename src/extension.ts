// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as provider from './externalTextDocumentFormattingProvider';



export function activate(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration().get<Record<string, provider.ExternalFormatterSettings>>('externalFormatters');
	if (!config) {
		return;
	}
	const disposeFormatter = vscode.languages.registerDocumentFormattingEditProvider(
		Object.keys(config),
		provider.create()
	);
	context.subscriptions.push(disposeFormatter);
}

export function deactivate() { }
