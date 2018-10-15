import { MongooseDocument } from 'mongoose';
import { defineSchemaMetadata, SchemaKey } from './mongo';

type DocumentMethod = 'init' | 'validate' | 'save' | 'remove';
type QueryMethod = 'count' | 'find' | 'findOne' | 'findOneAndRemove' | 'findOneAndUpdate' | 'update' | 'updateOne';
type ModelMethod = 'insertMany';

type HookNextFn = (err?: Error) => void;

type PreDoneFn = () => void;

type TypegooseDoc<T> = T & MongooseDocument;

type DocumentPreSerialFn<T> = (this: TypegooseDoc<T>, next: HookNextFn) => void;
type DocumentPreParallelFn<T> = (this: TypegooseDoc<T>, next: HookNextFn, done: PreDoneFn) => void;

type SimplePreSerialFn<T> = (next: HookNextFn) => void;
type SimplePreParallelFn<T> = (next: HookNextFn, done: PreDoneFn) => void;

type DocumentPostFn<T> = (this: TypegooseDoc<T>, doc: TypegooseDoc<T>, next?: HookNextFn) => void;
type ModelPostFn<T> = (result: any, next?: HookNextFn) => void;

type PostNumberResponse<T> = (result: number, next?: HookNextFn) => void;
type PostSingleResponse<T> = (result: TypegooseDoc<T>, next?: HookNextFn) => void;
type PostMultipleResponse<T> = (result: TypegooseDoc<T>[], next?: HookNextFn) => void;

type PostNumberWithError<T> = (error: Error, result: number, next: HookNextFn) => void;
type PostSingleWithError<T> = (error: Error, result: TypegooseDoc<T>, next: HookNextFn) => void;
type PostMultipleWithError<T> = (error: Error, result: TypegooseDoc<T>[], net: HookNextFn) => void;

type NumberMethod = 'count';
type SingleMethod = 'findOne' | 'findOneAndRemove' | 'findOneAndUpdate' | DocumentMethod;
type MultipleMethod = 'find' | 'update';

interface Hooks {
    pre<T>(method: DocumentMethod, fn: DocumentPreSerialFn<T>): ClassDecorator;
    pre<T>(method: DocumentMethod, parallel: boolean, fn: DocumentPreParallelFn<T>): ClassDecorator;

    pre<T>(method: QueryMethod | ModelMethod, fn: SimplePreSerialFn<T>): ClassDecorator;
    pre<T>(
        method: QueryMethod | ModelMethod,
        parallel: boolean,
        fn: SimplePreParallelFn<T>): ClassDecorator;

    // I had to disable linter to allow this. I only got proper code completion separating the functions
    post<T>(method: NumberMethod, fn: PostNumberResponse<T>): ClassDecorator;
    // tslint:disable-next-line:unified-signatures
    post<T>(method: NumberMethod, fn: PostNumberWithError<T>): ClassDecorator;

    post<T>(method: SingleMethod, fn: PostSingleResponse<T>): ClassDecorator;
    // tslint:disable-next-line:unified-signatures
    post<T>(method: SingleMethod, fn: PostSingleWithError<T>): ClassDecorator;

    post<T>(method: MultipleMethod, fn: PostMultipleResponse<T>): ClassDecorator;
    // tslint:disable-next-line:unified-signatures
    post<T>(method: MultipleMethod, fn: PostMultipleWithError<T>): ClassDecorator;

    post<T>(method: ModelMethod, fn: ModelPostFn<T> | PostMultipleResponse<T>): ClassDecorator;

    plugin(mongoosePlugin, options?): ClassDecorator;
}

const hooks: Hooks = {
    pre(...args): ClassDecorator {
        return (target) => {
            addToHooks(target, 'pre', args);
        };
    },
    post(...args): ClassDecorator {
        return (target: any) => {
            addToHooks(target, 'post', args);
        };
    },
    plugin(...args) {
        return (target: any) => {
            addToHooks(target, 'plugin', args);
        };
    }
};

const addToHooks = (target, hookType: 'pre' | 'post' | 'plugin', args) => {
    defineSchemaMetadata((obj) => {
        if (!obj)
            obj = [];
        obj = [...obj, args];
        return obj;
    }, SchemaKey.hook, target, hookType);
};

export const setPre = hooks.pre;
export const setPost = hooks.post;
export const setPlugin = hooks.plugin;
