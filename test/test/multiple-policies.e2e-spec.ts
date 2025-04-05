import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { needleStrings, seed, TestSeed } from '../prisma/seed';
import { createTestingApp, multiAppTest } from './helpers';

describe('Multiple policies e2e', () => {
    let nonStrictApp: NestExpressApplication;
    let strictApp: NestExpressApplication;
    let userSeeds: TestSeed[];
    const [needleString0] = needleStrings;

    beforeAll(async () => {
        nonStrictApp = await createTestingApp({ strict: false });
        strictApp = await createTestingApp({ strict: true });

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
                    .get('/combined-policies/comments/impossible?a=1&b=2')
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
