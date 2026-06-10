"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearTables = clearTables;
const typeorm_1 = require("typeorm");
async function clearTables(moduleFixture) {
    const dataSource = moduleFixture.get(typeorm_1.DataSource);
    const tableNames = dataSource.entityMetadatas
        .map((entity) => `"${entity.tableName}"`)
        .filter((tableName) => tableName !== '"migrations"');
    if (tableNames.length === 0) {
        return;
    }
    await dataSource.query(`TRUNCATE TABLE ${tableNames.join(', ')} RESTART IDENTITY CASCADE`);
}
//# sourceMappingURL=clear-tables.js.map