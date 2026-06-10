import type { TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

export async function clearTables(moduleFixture: TestingModule): Promise<void> {
  const dataSource = moduleFixture.get(DataSource);
  const tableNames = dataSource.entityMetadatas
    .map((entity) => `"${entity.tableName}"`)
    .filter((tableName) => tableName !== '"migrations"');

  if (tableNames.length === 0) {
    return;
  }

  await dataSource.query(`TRUNCATE TABLE ${tableNames.join(', ')} RESTART IDENTITY CASCADE`);
}
