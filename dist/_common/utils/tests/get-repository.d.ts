import type { TestingModule } from '@nestjs/testing';
import type { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import type { ObjectLiteral, Repository } from 'typeorm';
export declare function getRepository<T extends ObjectLiteral>(moduleFixture: TestingModule, entityClass: EntityClassOrSchema): Repository<T>;
