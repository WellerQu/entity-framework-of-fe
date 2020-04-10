"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var entityState_1 = __importDefault(require("./entityState"));
var entityTrace_1 = __importDefault(require("./entityTrace"));
var relationship_1 = __importDefault(require("./annotations/relationship"));
var entityMetadataManager_1 = __importDefault(require("./annotations/entityMetadataManager"));
var isEmpty_1 = __importDefault(require("./utils/isEmpty"));
var EntitySet = /** @class */ (function () {
    function EntitySet(ctx, type) {
        this.ctx = ctx;
        this.set = new Set();
        this.ownNavigatorRequests = {};
        this.otherNavigators = [];
        this.entityMetadata = { type: type };
        this.onPropertyChanged = this.onPropertyChanged.bind(this);
    }
    EntitySet.prototype.attachOriginDataToEntitySet = function (originData) {
        // 无数据
        if (isEmpty_1.default(originData)) {
            return null;
        }
        var entity = this.entry(originData);
        this.attach(entity);
        return entity;
    };
    EntitySet.prototype.getRelatedEntitySet = function (navigatorName) {
        var ctxPrototype = Reflect.getPrototypeOf(this.ctx);
        var entitySetMeta = entityMetadataManager_1.default.getEntitySet(ctxPrototype, navigatorName);
        if (!entitySetMeta) {
            throw new Error("\u5F53\u524D\u4E0A\u4E0B\u6587\u4E2D\u6CA1\u6709\u914D\u7F6EEntitySet \"" + navigatorName + "\"");
        }
        var entitySet = Reflect.get(this.ctx, entitySetMeta.propertyName);
        if (!entitySet) {
            throw new Error("\u5F53\u524D\u4E0A\u4E0B\u6587\u4E2D\u6CA1\u6709\u914D\u7F6EEntitySet \"" + entitySetMeta.propertyName + "\"");
        }
        return entitySet;
    };
    Object.defineProperty(EntitySet.prototype, "size", {
        get: function () {
            var entries = Array.from(this.set).filter(function (item) { return item.state !== entityState_1.default.Deleted && item.state !== entityState_1.default.Detached; });
            return entries.length;
        },
        enumerable: true,
        configurable: true
    });
    EntitySet.prototype.clean = function () {
        return this.cleanSet().cleanNavigators();
    };
    EntitySet.prototype.cleanSet = function () {
        var _this = this;
        Array.from(this.set).forEach(function (item) { return item.offPropertyChange(_this.onPropertyChanged); });
        this.set.clear();
        return this;
    };
    EntitySet.prototype.cleanNavigators = function () {
        this.ownNavigatorRequests = {};
        this.otherNavigators = [];
        return this;
    };
    EntitySet.prototype.add = function () {
        var _this = this;
        var entities = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            entities[_i] = arguments[_i];
        }
        entities.filter(function (item) { return !!item; }).forEach(function (addedItem) {
            var tracer = new entityTrace_1.default(addedItem, entityState_1.default.Added);
            tracer.onPropertyChange(_this.onPropertyChanged);
            _this.set.add(tracer);
        });
        return this;
    };
    EntitySet.prototype.remove = function () {
        var _this = this;
        var entities = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            entities[_i] = arguments[_i];
        }
        var navigators = entityMetadataManager_1.default.getNavigators(this.entityMetadata.type.prototype);
        entities.filter(function (item) { return !!item; }).forEach(function (removedItem) {
            var tracer = Array.from(_this.set)
                .find(function (item) { return (item.rawObject === removedItem || item.object === removedItem) &&
                item.state !== entityState_1.default.Deleted &&
                item.state !== entityState_1.default.Detached; });
            if (tracer) {
                // 删除与当前传入数据直接相关的数据
                navigators.forEach(function (nav) {
                    var entitySet = _this.getRelatedEntitySet(nav.navigatorName);
                    if (!entitySet) {
                        return;
                    }
                    var entry = Reflect.get(removedItem, nav.propertyName);
                    if (!entry) {
                        return;
                    }
                    if (nav.relationship === relationship_1.default.One) {
                        entitySet.remove(entry);
                    }
                    else if (nav.relationship === relationship_1.default.Many) {
                        entitySet.remove.apply(entitySet, __spread(entry));
                    }
                    else {
                        throw new Error('未定义的Relationship');
                    }
                });
                // 删除当前传入的数据
                tracer.state = entityState_1.default.Deleted;
                tracer.offPropertyChange(_this.onPropertyChanged);
                tracer.revoke();
            }
        });
        return this;
    };
    EntitySet.prototype.attach = function () {
        var _this = this;
        var entities = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            entities[_i] = arguments[_i];
        }
        entities.filter(function (item) { return !!item; }).forEach(function (attachedItem) {
            var tracer = new entityTrace_1.default(attachedItem, entityState_1.default.Unchanged);
            tracer.onPropertyChange(_this.onPropertyChanged);
            _this.set.add(tracer);
        });
        return this;
    };
    EntitySet.prototype.detach = function () {
        var _this = this;
        var entities = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            entities[_i] = arguments[_i];
        }
        entities.filter(function (item) { return !!item; }).forEach(function (detachedItem) {
            var stateTrace = Array.from(_this.set)
                .find(function (item) {
                return (item.object === detachedItem || item.rawObject === detachedItem) &&
                    item.state !== entityState_1.default.Detached &&
                    item.state !== entityState_1.default.Deleted;
            });
            if (stateTrace) {
                stateTrace.state = entityState_1.default.Detached;
                stateTrace.offPropertyChange(_this.onPropertyChanged);
                stateTrace.revoke();
            }
        });
        return this;
    };
    /**
     * 通过传入的主键在数据集中查询实体实例, 参数的顺序为实体模型中被注解为 @[[primary]]() 的字段的顺序
     *
     * @example
     * ```typescript
     * class Foo {
     *   @primary()
     *   id: number = 0
     *   @primary()
     *   version: number = 0
     * }
     *
     * ctx.foo.find(1, 2)
     * // 参数 1 作为id, 参数 2 作为version
     * ```
     *
     * @param primaryKeys {...any[]} 主键字段
     * @returns
     */
    EntitySet.prototype.find = function () {
        var primaryKeys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            primaryKeys[_i] = arguments[_i];
        }
        var stateTrace = Array.from(this.set).find(function (item) {
            var keys = entityMetadataManager_1.default.getPrimaryKeys(item.object.constructor.prototype);
            if (keys.length === 0) {
                return false;
            }
            if (item.state === entityState_1.default.Deleted) {
                return false;
            }
            if (item.state === entityState_1.default.Detached) {
                return false;
            }
            return keys.every(function (meta, index) {
                return Reflect.get(item.object, meta.fieldName) === primaryKeys[index];
            });
        });
        if (!stateTrace) {
            return;
        }
        return stateTrace.object;
    };
    EntitySet.prototype.filter = function (fn) {
        var stateTraces = Array.from(this.set).filter(function (item) {
            if (item.state === entityState_1.default.Deleted) {
                return false;
            }
            if (item.state === entityState_1.default.Detached) {
                return false;
            }
            return fn(Object.freeze(item.object));
        });
        return stateTraces.map(function (item) { return item.object; });
    };
    EntitySet.prototype.toList = function () {
        return Array.from(this.set).map(function (item) { return Object.freeze(item.object); });
    };
    EntitySet.prototype.load = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var queryMeta, _a, mapParameters, _b, mapEntity, params, requests;
            var _this = this;
            return __generator(this, function (_c) {
                queryMeta = entityMetadataManager_1.default
                    .getBehavior(this.entityMetadata.type.prototype, 'load');
                if (!queryMeta) {
                    throw new Error(this.entityMetadata.type.name + " \u6CA1\u6709\u914D\u7F6ELoad behavior");
                }
                _a = queryMeta.mapParameters, mapParameters = _a === void 0 ? function () {
                    var a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        a[_i] = arguments[_i];
                    }
                    return a;
                } : _a, _b = queryMeta.mapEntity, mapEntity = _b === void 0 ? function (a) { return a; } : _b;
                params = mapParameters.apply(void 0, __spread(args));
                requests = Object.values(this.ownNavigatorRequests);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.ctx.configuration
                            .fetchJSON(queryMeta.url, { method: queryMeta.method }, params)
                            .then(function (res) {
                            var data = mapEntity(res);
                            var entity = _this.attachOriginDataToEntitySet(data);
                            Promise.all(requests.map(function (fn) { return fn(entity); })).then(function () {
                                resolve(data);
                            });
                        }, reject);
                    })];
            });
        });
    };
    EntitySet.prototype.loadAll = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var queryMeta, _a, mapParameters, _b, mapEntity, params, requests;
            var _this = this;
            return __generator(this, function (_c) {
                queryMeta = entityMetadataManager_1.default
                    .getBehavior(this.entityMetadata.type.prototype, 'loadAll');
                if (!queryMeta) {
                    throw new Error(this.entityMetadata.type.name + " \u6CA1\u6709\u914D\u7F6ELoadAll behavior");
                }
                _a = queryMeta.mapParameters, mapParameters = _a === void 0 ? function () {
                    var a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        a[_i] = arguments[_i];
                    }
                    return a;
                } : _a, _b = queryMeta.mapEntity, mapEntity = _b === void 0 ? function (a) { return a; } : _b;
                params = mapParameters.apply(void 0, __spread(args));
                requests = Object.values(this.ownNavigatorRequests);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.ctx.configuration
                            .fetchJSON(queryMeta.url, { method: queryMeta.method }, params)
                            .then(function (res) {
                            var data = mapEntity(res);
                            var promises = (data || [])
                                .map(function (item) { return _this.attachOriginDataToEntitySet(item); })
                                .map(function (entity) { return requests.map(function (fn) { return fn(entity); }); })
                                .reduce(function (acc, val) { return acc.concat(val); }, []); // 降低数组维度
                            Promise.all(promises)
                                .then(function () {
                                resolve(data);
                            });
                        }, reject);
                    })];
            });
        });
    };
    EntitySet.prototype.include = function (navigatorName) {
        var _this = this;
        if (this.ownNavigatorRequests[navigatorName]) {
            return this;
        }
        var entitySet = this.getRelatedEntitySet(navigatorName);
        var navigator = entityMetadataManager_1.default.getNavigator(this.entityMetadata.type.prototype, navigatorName);
        if (!navigator) {
            this.otherNavigators.push(navigatorName);
            return this;
        }
        var foreignKeys = entityMetadataManager_1.default
            .getForeignKeys(this.entityMetadata.type.prototype)
            .filter(function (key) { return key.navigatorName === navigatorName; });
        var propertyName = navigator.propertyName;
        var getRequestParameters = function (entity) {
            return foreignKeys.map(function (key) { return Reflect.get(entity, key.propertyName); });
        };
        var request = function (entity) { return __awaiter(_this, void 0, void 0, function () {
            var parameters, set, useParameters, getRequests, getCollection_1;
            return __generator(this, function (_a) {
                if (!entity) {
                    return [2 /*return*/, Promise.resolve(null)];
                }
                parameters = getRequestParameters(entity);
                set = this.otherNavigators.reduce(function (es, nav) { return es.include(nav); }, entitySet);
                if (navigator.relationship === relationship_1.default.One) {
                    // 请求关联实体的数据
                    return [2 /*return*/, set.load.apply(set, __spread(parameters)).then(function (data) {
                            var relatedEntity = set.find.apply(set, __spread(parameters));
                            Reflect.set(entity, propertyName, relatedEntity);
                            return data;
                        })];
                }
                else if (navigator.relationship === relationship_1.default.Many) {
                    useParameters = function (exec) { return function (parameters) {
                        return parameters.filter(function (params) { return !!params; })
                            .map(function (params) { return params.map(exec); })
                            .reduce(function (acc, val) { return acc.concat(val); }, []);
                    }; };
                    getRequests = useParameters(function (primaryKey) { return set.load(primaryKey); });
                    getCollection_1 = useParameters(function (primaryKey) { return set.find(primaryKey); });
                    // 请求每一个关联实体的数据
                    return [2 /*return*/, Promise.all(getRequests(parameters)).then(function (res) {
                            var collection = getCollection_1(parameters);
                            Reflect.set(entity, propertyName, collection);
                            return res;
                        })];
                }
                else {
                    throw new Error("\u672A\u5B9A\u4E49\u7684 Relationship: " + navigator.relationship);
                }
                return [2 /*return*/];
            });
        }); };
        request.navigatorName = navigatorName;
        this.ownNavigatorRequests[navigatorName] = request;
        return this;
    };
    EntitySet.prototype.entry = function (originData) {
        var Type = this.entityMetadata.type;
        var instance = new Type();
        var members = entityMetadataManager_1.default.getMembers(Type.prototype);
        members.forEach(function (item) {
            var fieldData = Reflect.get(originData, item.fieldName);
            Reflect.set(instance, item.propertyName, fieldData);
        });
        return instance;
    };
    EntitySet.prototype.rawQuery = function (query) {
        var _this = this;
        var requests = Object.values(this.ownNavigatorRequests);
        return new Promise(function (resolve, reject) {
            query()
                .then(function (originData) {
                var entities = [];
                if (Array.isArray(originData)) {
                    for (var i = 0; i < originData.length; i++) {
                        var newEntity = _this.attachOriginDataToEntitySet(originData[i]);
                        if (newEntity) {
                            entities.push(newEntity);
                        }
                    }
                }
                else {
                    var newEntity = (_this.attachOriginDataToEntitySet(originData));
                    if (newEntity) {
                        entities.push(newEntity);
                    }
                }
                if (entities.length === 0) {
                    return resolve([]);
                }
                Promise.all(entities.map(function (entity) { return requests.map(function (fn) { return fn(entity); }); })
                    .reduce(function (acc, val) { return acc.concat(val); }, []) // 降低数组维度
                ).then(function () {
                    resolve(entities);
                }, reject);
            }, reject);
        });
    };
    EntitySet.prototype.synchronizeAddedState = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var object, identity, members, behavior, _a, mapParameters, _b, mapEntity, params;
            return __generator(this, function (_c) {
                object = item.rawObject;
                identity = function (a) { return a; };
                members = entityMetadataManager_1.default.getMembers(object.constructor.prototype);
                behavior = entityMetadataManager_1.default.getBehavior(object.constructor.prototype, 'add');
                if (!behavior) {
                    return [2 /*return*/, (Promise.reject(new Error(object.constructor.name + " \u6CA1\u6709\u914D\u7F6EAdd behavior")))];
                }
                _a = behavior.mapParameters, mapParameters = _a === void 0 ? identity : _a, _b = behavior.mapEntity, mapEntity = _b === void 0 ? identity : _b;
                params = mapParameters(members.reduce(function (params, m) {
                    Reflect.set(params, m.fieldName, Reflect.get(object, m.propertyName));
                    return params;
                }, {}));
                return [2 /*return*/, this.ctx.configuration.fetchJSON(behavior.url, { method: behavior.method }, params)
                        .then(mapEntity)
                        .then(function (res) {
                        item.state = entityState_1.default.Unchanged;
                        return res;
                    })];
            });
        });
    };
    EntitySet.prototype.synchronizeDeletedState = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var object, identity, primaryKeys, behavior, _a, mapParameters, _b, mapEntity, params;
            var _this = this;
            return __generator(this, function (_c) {
                object = item.rawObject;
                identity = function (a) { return a; };
                primaryKeys = entityMetadataManager_1.default.getPrimaryKeys(object.constructor.prototype);
                behavior = entityMetadataManager_1.default.getBehavior(object.constructor.prototype, 'delete');
                if (!behavior) {
                    return [2 /*return*/, (Promise.reject(new Error(object.constructor.name + " \u6CA1\u6709\u914D\u7F6EDelete behavior")))];
                }
                _a = behavior.mapParameters, mapParameters = _a === void 0 ? identity : _a, _b = behavior.mapEntity, mapEntity = _b === void 0 ? identity : _b;
                params = mapParameters(primaryKeys.reduce(function (params, m) {
                    Reflect.set(params, m.fieldName, Reflect.get(object, m.propertyName));
                    return params;
                }, {}));
                return [2 /*return*/, this.ctx.configuration.fetchJSON(behavior.url, { method: behavior.method }, params)
                        .then(mapEntity)
                        .then(function (res) {
                        _this.set.delete(item);
                        return res;
                    })];
            });
        });
    };
    EntitySet.prototype.synchronizeModifiedState = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var object, identity, members, behavior, _a, mapParameters, _b, mapEntity, params;
            return __generator(this, function (_c) {
                object = item.rawObject;
                identity = function (a) { return a; };
                members = entityMetadataManager_1.default.getMembers(object.constructor.prototype);
                behavior = entityMetadataManager_1.default.getBehavior(object.constructor.prototype, 'update');
                if (!behavior) {
                    return [2 /*return*/, (Promise.reject(new Error(object.constructor.name + " \u6CA1\u6709\u914D\u7F6EUpdate behavior")))];
                }
                _a = behavior.mapParameters, mapParameters = _a === void 0 ? identity : _a, _b = behavior.mapEntity, mapEntity = _b === void 0 ? identity : _b;
                params = mapParameters(members.reduce(function (params, m) {
                    Reflect.set(params, m.fieldName, Reflect.get(object, m.propertyName));
                    return params;
                }, {}));
                return [2 /*return*/, (this.ctx.configuration.fetchJSON(behavior.url, { method: behavior.method }, params)
                        .then(mapEntity)
                        .then(function (res) {
                        item.state = entityState_1.default.Unchanged;
                        return res;
                    }))];
            });
        });
    };
    EntitySet.prototype.synchronizeState = function () {
        var e_1, _a;
        var _this = this;
        var promises = [];
        var _loop_1 = function (item) {
            if (item.state !== entityState_1.default.Added &&
                item.state !== entityState_1.default.Modified &&
                item.state !== entityState_1.default.Deleted &&
                item.state !== entityState_1.default.Detached) {
                return "continue";
            }
            var state = item.state;
            if (state === entityState_1.default.Added) {
                promises.push(this_1.synchronizeAddedState(item));
                return "continue";
            }
            if (state === entityState_1.default.Deleted) {
                promises.push(this_1.synchronizeDeletedState(item));
                return "continue";
            }
            if (state === entityState_1.default.Modified) {
                promises.push(this_1.synchronizeModifiedState(item));
                return "continue";
            }
            if (state === entityState_1.default.Detached) {
                promises.push(Promise.resolve().then(function () {
                    _this.set.delete(item);
                }));
            }
        };
        var this_1 = this;
        try {
            for (var _b = __values(this.set), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                _loop_1(item);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return promises;
    };
    EntitySet.prototype.onPropertyChanged = function (tracer /*, e: PropertyChangeEvent<T, EntityState> */) {
        tracer.state = entityState_1.default.Modified;
    };
    return EntitySet;
}());
exports.default = EntitySet;
//# sourceMappingURL=entitySet.js.map