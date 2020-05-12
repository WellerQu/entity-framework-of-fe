"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var metadataType_1 = __importDefault(require("./metadataType"));
exports.MetadataType = metadataType_1.default;
var isEmpty_1 = __importDefault(require("../utils/isEmpty"));
var constraints_1 = __importDefault(require("../constants/constraints"));
exports.Constraints = constraints_1.default;
var UNREGISTER_DATATYPE = '未注册的数据类型';
/**
 * @module annotations
 * @class MetadataManager
 */
var EntityMetadataManager = /** @class */ (function () {
    function EntityMetadataManager() {
        this.managedModel = new WeakMap();
    }
    EntityMetadataManager.prototype.register = function (prototype, type, meta) {
        if (!this.managedModel.has(prototype)) {
            this.managedModel.set(prototype, {
                members: [],
                constraints: {}
            });
        }
        if (type === metadataType_1.default.Constraint) {
            var newMeta = meta;
            var allConstraints = this.managedModel.get(prototype).constraints;
            if (!allConstraints[newMeta.propertyName]) {
                allConstraints[newMeta.propertyName] = constraints_1.default.NONE;
            }
            allConstraints[newMeta.propertyName] |= newMeta.constraints;
            return allConstraints;
        }
        if (type === metadataType_1.default.Member) {
            return this.managedModel.get(prototype).members.push(meta);
        }
    };
    EntityMetadataManager.prototype.unregister = function (prototype) {
        this.managedModel.has(prototype) && this.managedModel.delete(prototype);
    };
    EntityMetadataManager.prototype.getMembers = function (prototype) {
        if (!this.managedModel.has(prototype)) {
            return [];
        }
        return this.managedModel.get(prototype).members;
    };
    EntityMetadataManager.prototype.getMemberConstraints = function (prototype) {
        if (!this.managedModel.has(prototype)) {
            return {};
        }
        return this.managedModel.get(prototype).constraints;
    };
    EntityMetadataManager.prototype.getMemberConstraint = function (prototype, propertyName) {
        return this.getMemberConstraints(prototype)[propertyName];
    };
    EntityMetadataManager.prototype.entry = function (originData, Type, isomorphism) {
        var _this = this;
        if (isomorphism === void 0) { isomorphism = false; }
        var members = this.getMembers(Type.prototype);
        if (!members) {
            throw new Error(UNREGISTER_DATATYPE);
        }
        if (!Array.isArray(originData)) {
            return this.entry([originData], Type, isomorphism)[0];
        }
        return originData.map(function (data) {
            var instance = new Type();
            if (isEmpty_1.default(data)) {
                return instance;
            }
            members.forEach(function (item) {
                var memberFieldData = Reflect.get(data, isomorphism ? item.propertyName : item.fieldName);
                if (memberFieldData === undefined || memberFieldData === null) {
                    // return Reflect.set(instance, item.propertyName, memberFieldData)
                    return;
                }
                if (!item.dataType) {
                    return Reflect.set(instance, item.propertyName, memberFieldData);
                }
                var memberInstance = _this.entry(memberFieldData, item.dataType(), isomorphism);
                Reflect.set(instance, item.propertyName, memberInstance);
            });
            return instance;
        });
    };
    EntityMetadataManager.prototype.reverse = function (instances, Type, constraints) {
        var _this = this;
        if (constraints === void 0) { constraints = constraints_1.default.NONE; }
        var members = this.getMembers(Type.prototype);
        if (!members) {
            throw new Error(UNREGISTER_DATATYPE);
        }
        if (instances === undefined || instances === null) {
            return instances;
        }
        if (!Array.isArray(instances)) {
            return this.reverse([instances], Type, constraints)[0];
        }
        return instances.map(function (record) {
            var store = {};
            members.forEach(function (member) {
                var _a;
                var memberConstraints = (_a = _this.getMemberConstraint(Type.prototype, member.propertyName)) !== null && _a !== void 0 ? _a : constraints_1.default.NONE;
                if ((constraints & constraints_1.default.READ_ONLY) === constraints_1.default.READ_ONLY && (memberConstraints & constraints_1.default.READ_ONLY) === constraints_1.default.READ_ONLY) {
                    return;
                }
                var data = Reflect.get(record, member.propertyName);
                if ((constraints & constraints_1.default.NON_EMPTY) === constraints_1.default.NON_EMPTY && (memberConstraints & constraints_1.default.NON_EMPTY) === constraints_1.default.NON_EMPTY && isEmpty_1.default(data)) {
                    return;
                }
                if (!member.dataType) {
                    return Reflect.set(store, member.fieldName, data);
                }
                var memberData = _this.reverse(data, member.dataType(), constraints);
                return Reflect.set(store, member.fieldName, memberData);
            });
            return store;
        });
    };
    return EntityMetadataManager;
}());
var manager = new EntityMetadataManager();
exports.default = manager;
//# sourceMappingURL=entityMetadataManager.js.map