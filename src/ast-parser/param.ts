export enum Params {
    Generic = 'Generic',
    Reference = 'Reference',
    Template = 'Template'
};

export interface ParamTemplate<T = any> {
    type: Params.Template;
    name: string;
    arguments: T[];
}

export interface ParamReference {
    type: Params.Reference;
    /**
     * List of container names that should 
     * be in this param
     */
    containers: string[];
}

export interface ParamGeneric {
    type: Params.Generic;
    name: string;
}

export type Param = ParamTemplate | ParamReference | ParamGeneric;