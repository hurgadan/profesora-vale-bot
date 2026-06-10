import { Server } from 'node:http';
import { type INestApplication } from '@nestjs/common';
import { type TestingModule } from '@nestjs/testing';
export declare const createTestingAppAndHttpServer: (testingModule: TestingModule) => Promise<{
    app: INestApplication;
    httpServer: Server;
}>;
