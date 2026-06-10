"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformToDto = transformToDto;
const class_transformer_1 = require("class-transformer");
const TRANSFORM_OPTIONS = {
    enableImplicitConversion: true,
    exposeUnsetFields: true,
    excludeExtraneousValues: true,
};
function transformToDto(type, source) {
    return (0, class_transformer_1.plainToInstance)(type, source, TRANSFORM_OPTIONS);
}
//# sourceMappingURL=transform-to-dto.js.map