export class ConstructorsContainer {
    ids: Map<number, any>;
    names: Map<string, any>;
    constructor() {
        this.ids = new Map();
        this.names = new Map();
    }
    registerContainerExistence(name: string, id: number, Constructor: any) {
        this.ids.set(id, Constructor);
        this.names.set(name, Constructor);
    }
}

export const schema = new ConstructorsContainer();