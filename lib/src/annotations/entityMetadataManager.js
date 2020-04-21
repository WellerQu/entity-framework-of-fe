"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var metadataType_1 = __importDefault(require("./metadataType"));
exports.MetadataType = metadataType_1.default;
var relationship_1 = __importDefault(require("../constants/relationship"));
exports.Relationship = relationship_1.default;
var constraints_1 = __importDefault(require("../constants/constraints"));
var UNREGISTER_DATATYPE = '未注册的数据类型';
/**
 * @module annotations
 * @class MetadataManager
 */
var EntityMetadataManager = /** @class */ (function () {
    function EntityMetadataManager() {
        this.managedModel = new WeakMap();
        this.managedContext = new WeakMap();
    }
    EntityMetadataManager.prototype.register = function (prototype, type, meta) {
        if (type !== metadataType_1.default.Entity && !this.managedModel.has(prototype)) {
            this.managedModel.set(prototype, {
                members: [],
                primaryKeys: [],
                foreignKeys: [],
                behaviors: {},
                navigators: {},
                constraints: {}
            });
        }
        if (type === metadataType_1.default.Entity && !this.managedContext.has(prototype)) {
            this.managedContext.set(prototype, {
                entities: []
            });
        }
        if (type === metadataType_1.default.Member) {
            return this.managedModel.get(prototype).members.push(meta);
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
        if (type === metadataType_1.default.PrimaryKey) {
            return this.managedModel.get(prototype).primaryKeys.push(meta);
        }
        if (type === metadataType_1.default.ForeignKey) {
            return this.managedModel.get(prototype).foreignKeys.push(meta);
        }
        if (type === metadataType_1.default.Navigator) {
            var navigatorMeta = meta;
            return (this.managedModel.get(prototype).navigators[navigatorMeta.navigatorName] = navigatorMeta);
        }
        if (type === metadataType_1.default.Behavior) {
            var behaviorMeta = meta;
            return (this.managedModel.get(prototype).behaviors[behaviorMeta.behaviorName] = behaviorMeta);
        }
        if (type === metadataType_1.default.Entity) {
            var entityMeta = meta;
            return (this.managedContext.get(prototype).entities.push(entityMeta));
        }
    };
    EntityMetadataManager.prototype.unregister = function (prototype) {
        this.managedModel.has(prototype) && this.managedModel.delete(prototype);
        this.managedContext.has(prototype) && this.managedContext.delete(prototype);
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
    EntityMetadataManager.prototype.getPrimaryKeys = function (prototype) {
        if (!this.managedModel.has(prototype)) {
            return [];
        }
        return this.managedModel.get(prototype).primaryKeys;
    };
    EntityMetadataManager.prototype.getForeignKeys = function (prototype) {
        if (!this.managedModel.has(prototype)) {
            return [];
        }
        return this.managedModel.get(prototype).foreignKeys;
    };
    EntityMetadataManager.prototype.getBehavior = function (prototype, behaviorName) {
        if (!this.managedModel.has(prototype)) {
            return;
        }
        return this.managedModel.get(prototype).behaviors[behaviorName];
    };
    EntityMetadataManager.prototype.getNavigator = function (prototype, navigatorName) {
        if (!this.managedModel.has(prototype)) {
            return;
        }
        return this.managedModel.get(prototype).navigators[navigatorName];
    };
    EntityMetadataManager.prototype.getNavigators = function (prototype) {
        if (!this.managedModel.has(prototype)) {
            return [];
        }
        return Object.values(this.managedModel.get(prototype).navigators);
    };
    EntityMetadataManager.prototype.getEntitySet = function (prototype, navigatorName) {
        if (!this.managedContext.has(prototype)) {
            return void 0;
        }
        return this.managedContext.get(prototype).entities.find(function (item) { return item.fieldName === navigatorName; });
    };
    EntityMetadataManager.prototype.getEntitySets = function (prototype) {
        if (!this.managedContext.has(prototype)) {
            return [];
        }
        return this.managedContext.get(prototype).entities;
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
            members.forEach(function (item) {
                var memberFieldData = Reflect.get(data, isomorphism ? item.propertyName : item.fieldName);
                if (memberFieldData === undefined) {
                    // return Reflect.set(instance, item.propertyName, memberFieldData)
                    return;
                }
                if (!item.dataType) {
                    return Reflect.set(instance, item.propertyName, memberFieldData);
                }
                var memberInstance = _this.entry(memberFieldData, item.dataType, isomorphism);
                return Reflect.set(instance, item.propertyName, memberInstance);
            });
            return instance;
        });
    };
    EntityMetadataManager.prototype.reverse = function (instance, Type) {
        var _this = this;
        var members = this.getMembers(Type.prototype);
        if (!members) {
            throw new Error(UNREGISTER_DATATYPE);
        }
        if (!Array.isArray(instance)) {
            return this.reverse([instance], Type)[0];
        }
        return instance.map(function (item) {
            var store = {};
            members.forEach(function (member) {
                var data = Reflect.get(item, member.propertyName);
                if (!data) {
                    return Reflect.set(store, member.fieldName, data);
                }
                if (!member.dataType) {
                    return Reflect.set(store, member.fieldName, data);
                }
                var memberData = _this.reverse(data, member.dataType);
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