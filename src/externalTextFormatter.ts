import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

import * as readline from 'readline';
import * as process from 'process';
export type Formatter = (content: string) => Promise<string>;

export interface FormatterSettings {
    command: string;
    args: string[];
    workDir: string;
}

export type ExternalTextFormatter = (settings: FormatterSettings) => Formatter;


const externalProcessWithRedirects: (settings: FormatterSettings) => Promise<ChildProcessWithoutNullStreams> =
    async ({ command, workDir, args }) => {
        const externalProcess = await new Promise<ChildProcessWithoutNullStreams>((resolve, reject) => {
            const externalProcess = spawn(command, args, {
                cwd: workDir,
                stdio: 'pipe'
            }).on('error', (e) => {
                if ((e as any).code === 'ENOENT') {
                    reject(new Error(`Could not run the command "${[command, ...args].join(' ')}". Make sure the program "${command}" is on your PATH`))
                    return;
                }
                reject(e);
            });
            if (externalProcess.pid) {
                resolve(externalProcess);
            }
        });

        externalProcess.stdout.setEncoding('utf8');
        const stdoutReader = readline.createInterface({ input: externalProcess.stdout });
        stdoutReader.on('line', (line) => console.debug(`[ExternalFormatter] ${line}`));

        const stderrReader = readline.createInterface({ input: externalProcess.stderr });
        stderrReader.on('line', (line) => console.error(`[ExternalFormatter] ${line}`));
        return externalProcess;
    };



export const externalTextFormatter: ExternalTextFormatter =
    (opts) => async (content) => {
        const externalProcess = await externalProcessWithRedirects(opts);
        const output: string[] = [];
        const err: string[] = [];

        externalProcess.stdout.on('data', (chunk) => output.push(chunk));
        externalProcess.stderr.on('data', (chunk) => err.push(chunk));
        externalProcess.stdin.write(content, () => externalProcess.stdin.end());

        return await new Promise((resolve, reject) => {
            externalProcess.on('exit', (exitCode) => {
                if (typeof exitCode === 'number' && exitCode !== 0) {
                    reject(new Error(`External formatter "${[opts.command, ...opts.args].join(' ')}" exited with code ${exitCode}`));
                    return;
                }
                resolve(output.join(''));
            });
        });
    };
