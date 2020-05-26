declare type Store = {
    [key: string]: any;
};
export declare const keyPathGetter: <T = any>(keyPath: string, defaultValue?: T | undefined) => (target: Store) => T;
export declare const keyPathSetter: <T = any>(keyPath: string) => (target: Store, value: T) => T;
export {};
