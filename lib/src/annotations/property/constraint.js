"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var entityMetadataManager_1 = __importStar(require("../entityMetadataManager"));
/**
 * 用来注解实体模型中的值约束
 *
 * @example
 * ```typescript
 * class Foo {
 *   @constraint(Constraint.NON_EMPTY_ON_ADDED | Constraint.NON_EMPTY_ON_MODIFIED)
 *   bid: number = 0
 * }
 * ```
 *
 * @param constraints {Constraints} 约束
 */
var constraint = function (constraints) { return function (target, propertyName) {
    entityMetadataManager_1.default.register(target, entityMetadataManager_1.MetadataType.Constraint, {
        constraints: constraints,
        propertyName: propertyName
    });
}; };
exports.default = constraint;
//# sourceMappingURL=constraint.js.map