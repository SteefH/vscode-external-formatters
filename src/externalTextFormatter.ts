import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
export type Formatter = (content: string) => Promise<string>;

export interface FormatterSettings {
    command: string;
    args?: string[];
    workDir: string;
}


export class ExternalTextFormatterError extends Error {

    readonly command: string;
    readonly arguments: ReadonlyArray<string>;
    readonly exitCode: number;
    readonly stderr: string;

    constructor(command: string, args: ReadonlyArray<string>, exitCode: number, stderr: string) {
        super();
        this.command = command;
        this.arguments = args;
        this.exitCode = exitCode;
        this.stderr = stderr;
    }
}

export type ExternalTextFormatter = (settings: FormatterSettings) => Formatter;

const externalProcessWithRedirects: (settings: FormatterSettings) => Promise<ChildProcessWithoutNullStreams> =
    async ({ command, workDir, args = [] }) =>
        new Promise<ChildProcessWithoutNullStreams>((resolve, reject) => {
            const externalProcess = spawn(command, args, {
                cwd: workDir,
                stdio: 'pipe'
            }).on('error', (e) => {
                if ((e as any).code === 'ENOENT') {
                    reject(new Error(`Could not run the command "${[command, ...args].join(' ')}". Make sure the program "${command}" is on your PATH`));
                    return;
                }
                reject(e);
            });
            if (externalProcess.pid) {
                externalProcess.stdout.setEncoding('utf8');
                resolve(externalProcess);
            }
        });


export const externalTextFormatter: ExternalTextFormatter =
    (opts) => async (content) => {
        const { command, args = [] } = opts;
        const externalProcess = await externalProcessWithRedirects(opts);
        const output: string[] = [];
        const err: string[] = [];

        externalProcess.stdout.on('data', output.push.bind(output));
        externalProcess.stderr.on('data', err.push.bind(err));

        externalProcess.stdin.write(content, () => externalProcess.stdin.end());

        return new Promise((resolve, reject) => {
            externalProcess.on('exit', (exitCode) => {
                if (typeof exitCode === 'number' && exitCode !== 0) {
                    reject(new ExternalTextFormatterError(
                        command, args, exitCode, err.join('')
                    ));
                } else {
                    resolve(output.join(''));
                }
            });
        });
    };
