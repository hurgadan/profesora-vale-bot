"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepository = getRepository;
const typeorm_1 = require("@nestjs/typeorm");
function getRepository(moduleFixture, entityClass) {
    return moduleFixture.get((0, typeorm_1.getRepositoryToken)(entityClass));
}
//# sourceMappingURL=get-repository.js.map