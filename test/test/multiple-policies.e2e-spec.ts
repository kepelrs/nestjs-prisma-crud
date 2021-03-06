import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { needleStrings, seed, TestSeed } from '../prisma/seed';
import { AppModule, StrictModeAppModule } from '../src/app.module';
import { multiAppTest } from './helpers';

describe('Multiple policies e2e', () => {
    let nonStrictApp: INestApplication;
    let strictApp: INestApplication;
    let userSeeds: TestSeed[];
    const [needleString0] = needleStrings;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        const strictModuleFixture: TestingModule = await Test.createTestingModule({
            imports: [StrictModeAppModule],
        }).compile();

        nonStrictApp = moduleFixture.createNestApplication();
        strictApp = strictModuleFixture.createNestApplication();
        await nonStrictApp.init();
        await strictApp.init();
    });

    beforeEach(async () => {
        try {
            userSeeds = await seed(true);
        } catch (e) {
            console.log(`Error during beforeEach: ${e.message || e}`);
        }
    });

    afterAll(async () => {
        nonStrictApp.close();
        strictApp.close();
    });

    describe('multiple MustMatchValue', () => {
        it('impossible combination results in 0 records', async () => {
            await multiAppTest([nonStrictApp, strictApp], async (app) => {
                await request(app.getHttpServer())
                    .get('/combined-policies/comments/impossible')
                    .expect(200)
                    .then((res) => {
                        expect(res?.body?.data?.length).toBe(0);
                    });
            });
        });

        it('repeated combination results in correct record', async () => {
            await multiAppTest([nonStrictApp, strictApp], async (app) => {
                await request(app.getHttpServer())
                    .get('/combined-policies/comments/repeated')
                    .expect(200)
                    .then((res) => {
                        expect(res.body?.data?.length).toEqual(1);
                    });
            });
        });
    });
});
