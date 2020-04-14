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
    return EntityMetadataManager;
}());
var manager = new EntityMetadataManager();
exports.default = manager;
//# sourceMappingURL=entityMetadataManager.js.map