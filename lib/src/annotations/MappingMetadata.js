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
var MappingMetadata = /** @class */ (function () {
    function MappingMetadata(ctx, next) {
        this.ctx = ctx;
        this.next = next;
    }
    MappingMetadata.prototype.setData = function (type, prototype, meta) {
        if (type === metadataType_1.default.Mapping) {
            if (!this.ctx.model.has(prototype)) {
                this.ctx.model.set(prototype, { mappings: {} });
            }
            var metadata = this.ctx.model.get(prototype);
            if (!metadata.mappings) {
                metadata.mappings = {};
            }
            metadata.mappings[meta.propertyName] = meta;
            return;
        }
        if (this.next) {
            this.next.setData(type, prototype, meta);
        }
    };
    MappingMetadata.prototype.getData = function (type, prototype) {
        var _a;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (type === metadataType_1.default.Mapping) {
            var metadata = this.ctx.model.get(prototype);
            if (!metadata) {
                return;
            }
            var propertyName = args[0];
            if (!propertyName) {
                return metadata.mappings;
            }
            return metadata.mappings ? metadata.mappings[propertyName] : undefined;
        }
        if (this.next) {
            return (_a = this.next).getData.apply(_a, __spread([type, prototype], args));
        }
    };
    return MappingMetadata;
}());
exports.MappingMetadata = MappingMetadata;
//# sourceMappingURL=MappingMetadata.js.map