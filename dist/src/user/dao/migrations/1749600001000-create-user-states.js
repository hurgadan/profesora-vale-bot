"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserStates1749600001000 = void 0;
const typeorm_1 = require("typeorm");
class CreateUserStates1749600001000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'user_states',
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'user_id', type: 'integer', isNullable: false },
                { name: 'pending_action', type: 'varchar', isNullable: true },
                { name: 'updated_at', type: 'timestamp', default: 'now()' },
            ],
        }), true);
        await queryRunner.createForeignKey('user_states', new typeorm_1.TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'telegram_users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('user_states', true);
    }
}
exports.CreateUserStates1749600001000 = CreateUserStates1749600001000;
//# sourceMappingURL=1749600001000-create-user-states.js.map