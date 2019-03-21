export interface IImportOptions {
    default?: string;
    args: string[];
}

export default class ModuleResolver {
    public imports = new Map<string, {
        name: string;
        args: string[];
        default?: string;
    }>();
    constructor(private moduleCache: Map<string, string>) {
    }
    public requireImport(name: string, inputOptions: string | IImportOptions) {
        let options: IImportOptions | undefined;
        if(typeof inputOptions === 'string') {
            options = {
                default: inputOptions,
                args: []
            };
        } else {
            options = inputOptions;
        }
        for(const arg of options.args) {
            if(!/^([a-zA-Z\-]+)$/.test(arg)) {
                throw new Error(`Invalid argument: ${arg}`);
            }
        }
        const foundImport = this.imports.get(name);
        if(foundImport) {
            for(const arg of options.args) {
                if(foundImport.args.indexOf(arg) === -1) {
                    foundImport.args.push(arg);
                }
            }
        }
        if(!foundImport) {
            this.imports.set(name, {
                name: this.resolve(name),
                default: options.default,
                args: options.args
            });
        }
    }
    private resolve(moduleName: string): string {
        const value = this.moduleCache.get(moduleName);
        if(!value) {
            return moduleName;
        }
        return value;
    }
}