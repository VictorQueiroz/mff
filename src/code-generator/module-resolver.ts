export default class ModuleResolver {
    constructor(private moduleCache: Map<string, string>) {
    }
    public resolve(moduleName: string): string {
        const value = this.moduleCache.get(moduleName);
        if(!value) {
            return moduleName;
        }
        return value;
    }
}