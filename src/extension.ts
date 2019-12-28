import * as vscode from 'vscode';
import * as provider from './externalTextDocumentFormattingProvider';
import * as logging from './logging';
import * as config from './configuration';

let registration: vscode.Disposable | undefined = undefined;

const register = () => {
	const languages = config.getConfiguredLanguageIds();
	if (!languages) {
		return;
	}
	registration = vscode.languages.registerDocumentFormattingEditProvider(
		languages, provider.create()
	);
};

export function activate(context: vscode.ExtensionContext) {
	const outputChannel = vscode.window.createOutputChannel('External formatters');
	const errorChannelRegistration = logging.registerErrorChannel(outputChannel);
	const outputChannelRegistration = logging.registerOutputChannel(outputChannel);
	register();
	const disposeConfigurationChangeListener = config.onExtensionConfigChange(() => {
		registration?.dispose();
		register();
	});
	context.subscriptions.push(
		vscode.Disposable.from(
			new vscode.Disposable(() => registration?.dispose()),
			disposeConfigurationChangeListener,
			outputChannelRegistration,
			errorChannelRegistration,
			outputChannel
		)
	);
}
