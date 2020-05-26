"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MetadataContext_1 = require("./MetadataContext");
exports.ConstraintOption = MetadataContext_1.ConstraintOption;
var ConstraintMetadata_1 = require("./ConstraintMetadata");
var MemberMetadata_1 = require("./MemberMetadata");
var MappingMetadata_1 = require("./MappingMetadata");
var context = new MetadataContext_1.MetadataContext([
    ConstraintMetadata_1.ConstraintMetadata,
    MemberMetadata_1.MemberMetadata,
    MappingMetadata_1.MappingMetadata
]);
exports.default = context;
//# sourceMappingURL=index.js.map