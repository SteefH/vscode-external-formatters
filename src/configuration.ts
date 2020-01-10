import * as vscode from 'vscode';

const configurationKey = 'externalFormatters';

const languagesConfigurationKey = `${configurationKey}.languages`;
const globConfigurationKey = `${configurationKey}.globPatterns`;

export type FormatterConfig = {
    command: string;
    arguments?: string[];
};

type LanguageConfigs = Record<string, FormatterConfig>;
type GlobPatternConfigs = Record<string, FormatterConfig>;

const getConfig: <ConfigType>(key: string) => (ConfigType | undefined) =
    <ConfigType>(key: string) => vscode.workspace.getConfiguration().get<ConfigType>(key);


type RecordEntry<T extends Record<K, V>, K extends keyof any = keyof T, V = T[K]> = [K, V];
type RecordEntries<T> = Array<RecordEntry<T>>;

const recordEntries: <T extends Record<any, any>>(rec: T) => RecordEntries<T> = <T>(r: T) =>
    <RecordEntries<T>>Object.entries(r);

type FilterAndFormatterConfig = [vscode.DocumentFilter, FormatterConfig];

export const getFormatterConfigs: () => Array<FilterAndFormatterConfig> = () => {
    const languages = recordEntries(
        getConfig<LanguageConfigs>(languagesConfigurationKey) || {}
    );
    const globPatterns = recordEntries(
        getConfig<GlobPatternConfigs>(globConfigurationKey) || {}
    );

    return <Array<FilterAndFormatterConfig>>[
        ...languages.map(([language, config]) => [{ language }, config]),
        ...globPatterns.map(([pattern, config]) => [{ pattern }, config])
    ];
};


export const onExtensionConfigChange: (callback: () => any) => vscode.Disposable =
    (callback) => vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(configurationKey)) {
            callback();
        }
    });


const keys: <T extends {}>(o: T) => Array<keyof T> = (o) => <Array<keyof typeof o>>Object.keys(o);

const valueLocationMapping = {
    globalValue: vscode.ConfigurationTarget.Global,
    workspaceValue: vscode.ConfigurationTarget.Workspace,
    workspaceFolderValue: vscode.ConfigurationTarget.WorkspaceFolder
};

export const migrate: () => Promise<void> = async () => {

    const workspaceConfiguration = vscode.workspace.getConfiguration();

    const newConfig = workspaceConfiguration.get<LanguageConfigs>(languagesConfigurationKey);
    if (newConfig && keys(newConfig).length) { return; }

    const inspected = workspaceConfiguration.inspect<LanguageConfigs>(configurationKey);
    if (!inspected) { return; }

    const sectionKeys = keys(valueLocationMapping);
    for (let sectionKey of sectionKeys) {
        const legacySettings = inspected[sectionKey];
        if (legacySettings) {
            const configTarget = valueLocationMapping[sectionKey];
            const { languages, globPatterns, ...cleanedLegacySettings } = legacySettings;

            await workspaceConfiguration.update(languagesConfigurationKey, cleanedLegacySettings, configTarget);
        }
    }
};

