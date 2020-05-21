"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __importDefault(require("../index"));
var metadataType_1 = __importDefault(require("../../constants/metadataType"));
/**
 * 用来注解实体模型中的值位置映射
 *
 * @example
 * ```typescript
 * class Foo {
 *   @mapping('a.b.c)
 *   bid: number = 0
 * }
 * ```
 *
 * @param path {string} 位置描述字符串
 */
var mapping = function (path) { return function (target, propertyName) {
    index_1.default.register(target, metadataType_1.default.Mapping, {
        path: path,
        propertyName: propertyName
    });
}; };
exports.default = mapping;
//# sourceMappingURL=mapping.js.map