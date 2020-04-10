"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MetadataType;
(function (MetadataType) {
    MetadataType[MetadataType["Member"] = 1] = "Member";
    MetadataType[MetadataType["PrimaryKey"] = 2] = "PrimaryKey";
    MetadataType[MetadataType["ForeignKey"] = 4] = "ForeignKey";
    MetadataType[MetadataType["Navigator"] = 8] = "Navigator";
    MetadataType[MetadataType["Behavior"] = 16] = "Behavior";
    MetadataType[MetadataType["Entity"] = 32] = "Entity";
})(MetadataType || (MetadataType = {}));
exports.default = MetadataType;
//# sourceMappingURL=metadataType.js.map