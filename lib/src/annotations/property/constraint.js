"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __importDefault(require("../index"));
var metadataType_1 = __importDefault(require("../../constants/metadataType"));
/**
 * 用来注解实体模型中的值约束
 *
 * @example
 * ```typescript
 * class Foo {
 *   @constraint(ConstraintOption.NON_EMPTY)
 *   bid: number = 0
 * }
 * ```
 *
 * @param constraints {ConstraintOption} 约束
 */
var constraint = function (constraints) { return function (target, propertyName) {
    index_1.default.register(target, metadataType_1.default.Constraint, {
        constraints: constraints,
        propertyName: propertyName
    });
}; };
exports.default = constraint;
//# sourceMappingURL=constraint.js.map