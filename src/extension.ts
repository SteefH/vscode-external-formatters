import * as vscode from 'vscode';
import * as provider from './externalTextDocumentFormattingProvider';
import * as config from './configuration';

let registration: vscode.Disposable | undefined = undefined;

const register = () => {
	const formatterConfigs = config.getFormatterConfigs();
	if (!formatterConfigs.length) {
		return;
	}
	registration = vscode.languages.registerDocumentFormattingEditProvider(
		formatterConfigs.map(([selector]) => selector),
		provider.create()
	);
};

export function activate(context: vscode.ExtensionContext) {
	config.migrate().catch(async (reason) => {
		const result = await vscode.window.showErrorMessage(
			`An attempt to migrate your External Formatters settings to the new schema failed.` +
			`Please consult the extension's documentation.` +
			`Reason: ${reason}`,
			'Show extension docs'
		);
		if (result) {
			vscode.commands.executeCommand('extension.open', 'SteefH.external-formatters');
		}
	}).finally(() => {
		register();
		const disposeConfigurationChangeListener = config.onExtensionConfigChange(() => {
			registration?.dispose();
			register();
		});
		context.subscriptions.push(
			vscode.Disposable.from(
				new vscode.Disposable(() => registration?.dispose()),
				disposeConfigurationChangeListener
			)
		);
	});
}
