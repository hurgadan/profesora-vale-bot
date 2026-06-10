"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
exports.default = typeorm_1.TypeOrmModule.forRootAsync({
    imports: [config_1.ConfigModule],
    inject: [config_1.ConfigService],
    useFactory: (configService) => {
        const opts = configService.getOrThrow('databaseConnectionOptions');
        if (!opts)
            throw new Error('Database config is missing');
        return {
            ...opts,
            autoLoadEntities: true,
        };
    },
});
//# sourceMappingURL=type-orm.js.map