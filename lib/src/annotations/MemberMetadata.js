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
var MemberMetadata = /** @class */ (function () {
    function MemberMetadata(ctx, next) {
        this.ctx = ctx;
        this.next = next;
    }
    MemberMetadata.prototype.setData = function (type, prototype, meta) {
        if (type === metadataType_1.default.Member) {
            if (!this.ctx.model.has(prototype)) {
                this.ctx.model.set(prototype, { members: [] });
            }
            var metadata = this.ctx.model.get(prototype);
            if (!metadata.members) {
                metadata.members = [];
            }
            metadata.members.push(meta);
            return;
        }
        if (this.next) {
            return this.next.setData(type, prototype, meta);
        }
    };
    MemberMetadata.prototype.getData = function (type, prototype) {
        var _a;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var _b;
        if (type === metadataType_1.default.Member) {
            var metadata = this.ctx.model.get(prototype);
            if (!metadata) {
                return;
            }
            var propertyName_1 = args[0];
            if (!propertyName_1) {
                return metadata.members;
            }
            return (_b = metadata.members) === null || _b === void 0 ? void 0 : _b.find(function (item) { return item.propertyName === propertyName_1; });
        }
        if (this.next) {
            return (_a = this.next).getData.apply(_a, __spread([type, prototype], args));
        }
    };
    return MemberMetadata;
}());
exports.MemberMetadata = MemberMetadata;
//# sourceMappingURL=MemberMetadata.js.map