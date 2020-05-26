"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var metadataType_1 = __importDefault(require("../constants/metadataType"));
exports.MetadataType = metadataType_1.default;
var isEmpty_1 = __importDefault(require("../utils/isEmpty"));
var constraintOption_1 = __importDefault(require("../constants/constraintOption"));
exports.ConstraintOption = constraintOption_1.default;
var keyPath_1 = require("../utils/keyPath");
var UNREGISTER_DATATYPE = '未注册的数据类型';
/**
 * @module annotations
 * @class MetadataContext
 */
var MetadataContext = /** @class */ (function () {
    function MetadataContext(plugins) {
        var _this = this;
        this.managedModel = new WeakMap();
        // 实例化插件, 创建职责链
        this.pluginInstances = plugins.reduce(function (next, Type) { return new Type(_this, next); }, undefined);
    }
    Object.defineProperty(MetadataContext.prototype, "model", {
        get: function () {
            return this.managedModel;
        },
        enumerable: true,
        configurable: true
    });
    MetadataContext.prototype.register = function (prototype, type, meta) {
        if (!this.pluginInstances) {
            return;
        }
        this.pluginInstances.setData(type, prototype, meta);
    };
    MetadataContext.prototype.unregister = function (prototype) {
        this.managedModel.has(prototype) && this.managedModel.delete(prototype);
    };
    MetadataContext.prototype.getRegisterData = function (type, prototype, propertyName) {
        if (!this.pluginInstances) {
            return undefined;
        }
        return this.pluginInstances.getData(type, prototype, propertyName);
    };
    MetadataContext.prototype.entry = function (originData, Type, isomorphism) {
        var _this = this;
        if (isomorphism === void 0) { isomorphism = false; }
        var members = this.getRegisterData(metadataType_1.default.Member, Type.prototype);
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
                var _a;
                var mapping = _this.getRegisterData(metadataType_1.default.Mapping, Type.prototype, item.propertyName);
                var key = isomorphism ? item.propertyName : item.fieldName;
                var path = (_a = mapping === null || mapping === void 0 ? void 0 : mapping.path.split('.').concat([key]).join('.')) !== null && _a !== void 0 ? _a : key;
                var getter = keyPath_1.keyPathGetter(path);
                var memberFieldData = getter(data);
                if (memberFieldData === undefined || memberFieldData === null) {
                    return;
                }
                if (!item.propertyDataType) {
                    return Reflect.set(instance, item.propertyName, memberFieldData);
                }
                var memberInstance = _this.entry(memberFieldData, item.propertyDataType(), isomorphism);
                Reflect.set(instance, item.propertyName, memberInstance);
            });
            return instance;
        });
    };
    MetadataContext.prototype.revert = function (instances, Type, constraints) {
        var _this = this;
        if (constraints === void 0) { constraints = constraintOption_1.default.NONE; }
        var members = this.getRegisterData(metadataType_1.default.Member, Type.prototype);
        if (!members) {
            throw new Error(UNREGISTER_DATATYPE);
        }
        if (instances === undefined || instances === null) {
            return instances;
        }
        if (!Array.isArray(instances)) {
            return this.revert([instances], Type, constraints)[0];
        }
        return instances.map(function (record) {
            var store = {};
            members.forEach(function (member) {
                var _a;
                var memberConstraints = (_a = _this.getRegisterData(metadataType_1.default.Constraint, Type.prototype, member.propertyName)) !== null && _a !== void 0 ? _a : constraintOption_1.default.NONE;
                if ((constraints & constraintOption_1.default.READ_ONLY) === constraintOption_1.default.READ_ONLY && (memberConstraints & constraintOption_1.default.READ_ONLY) === constraintOption_1.default.READ_ONLY) {
                    return;
                }
                var data = Reflect.get(record, member.propertyName);
                if ((constraints & constraintOption_1.default.NON_EMPTY) === constraintOption_1.default.NON_EMPTY && (memberConstraints & constraintOption_1.default.NON_EMPTY) === constraintOption_1.default.NON_EMPTY && isEmpty_1.default(data)) {
                    return;
                }
                var mapping = _this.getRegisterData(metadataType_1.default.Mapping, Type.prototype, member.propertyName);
                var mappingPath = mapping ? mapping.path.split('.') : [];
                var setter = keyPath_1.keyPathSetter(__spread(mappingPath, [member.fieldName]).join('.'));
                if (!member.propertyDataType) {
                    return setter(store, data);
                    // return Reflect.set(store, member.fieldName, data)
                }
                var memberData = _this.revert(data, member.propertyDataType(), constraints);
                // return Reflect.set(store, member.fieldName, memberData)
                return setter(store, memberData);
            });
            return store;
        });
    };
    return MetadataContext;
}());
exports.MetadataContext = MetadataContext;
//# sourceMappingURL=MetadataContext.js.map