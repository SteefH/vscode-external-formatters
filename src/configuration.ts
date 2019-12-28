import * as vscode from 'vscode';

const configurationKey = 'externalFormatters';

export type LanguageConfig = {
    command: string;
    arguments?: string[];
};

export type ExtensionConfig = Record<string, LanguageConfig>;

const getExtensionConfig: () => ExtensionConfig | undefined =
    () => vscode.workspace.getConfiguration().get<ExtensionConfig>(configurationKey);

export const getConfiguredLanguageIds: () => string[] | undefined =
    () => {
        const config = getExtensionConfig();
        if (!config) {
            return;
        }
        return Object.keys(config);
    };

export const getLanguageConfiguration: (languageId: string) => LanguageConfig | undefined =
    (languageId) => getExtensionConfig()?.[languageId];

export const onExtensionConfigChange: (callback: () => any) => vscode.Disposable =
    (callback) => vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(configurationKey)) {
            callback();
        }
    });
