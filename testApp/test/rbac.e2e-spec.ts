import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { needleStrings, seed } from '../prisma/seed';
import { AppModule, StrictModeAppModule } from '../src/app.module';
import { RoleID } from '../src/authentication.middleware';
import { multiAppTest } from './helpers';

describe('AccessPolicy RBAC e2e', () => {
    let nonStrictApp: INestApplication;
    let strictApp: INestApplication;
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
            await seed(true);
        } catch (e) {
            console.log(`Error during beforeEach: ${e.message || e}`);
        }
    });

    afterAll(async () => {
        nonStrictApp.close();
        strictApp.close();
    });

    describe(`'everyone' setting`, () => {
        describe('grants access', () => {
            it('to unauthenticated users', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .get('/rbac/users/everyone')
                        .expect(200)
                        .then((res) => {
                            expect(res.body?.data?.length).toBeGreaterThan(1);
                        });
                });
            });

            it('to authenticated users with a single role', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .get('/rbac/users/everyone')
                        .query({ _testingRoles: `${RoleID.LIMITED_ACCESS}` })
                        .expect(200)
                        .then((res) => {
                            expect(res.body?.data?.length).toBeGreaterThan(1);
                        });
                });
            });

            it('to authenticated users without any roles', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .get('/rbac/users/everyone')
                        .query({ _testingRoles: `` })
                        .expect(200)
                        .then((res) => {
                            expect(res.body?.data?.length).toBeGreaterThan(1);
                        });
                });
            });
        });
    });

    describe(`'anyAuthenticated' setting`, () => {
        describe('denies access', () => {
            it('when client is unauthenticated', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .get('/rbac/users/anyAuthenticated')
                        .expect(401);
                });
            });

            it('when authenticated but no roles are present', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .get('/rbac/users/anyAuthenticated')
                        .query({ _testingRoles: ``, _userId: needleString0 })
                        .expect(403);
                });
            });
        });

        describe('grants access', () => {
            it('when any role is present (1)', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .get('/rbac/users/anyAuthenticated')
                        .query({ _testingRoles: `${RoleID.ALWAYS_ACCESS}` })
                        .expect(200)
                        .then((res) => {
                            expect(res.body?.data?.length).toBeGreaterThan(1);
                        });
                });
            });

            it('when any role is present (2)', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .get('/rbac/users/anyAuthenticated')
                        .query({ _testingRoles: `${RoleID.LIMITED_ACCESS}` })
                        .expect(200)
                        .then((res) => {
                            expect(res.body?.data?.length).toBeGreaterThan(1);
                        });
                });
            });
        });
    });

    describe('[ids] setting', () => {
        describe('denies access', () => {
            it('when user is not authenticated ', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer()).get('/rbac/users/specificRoles').expect(401);
                });
            });

            it('when role is not in allowedRoles ', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .get('/rbac/users/specificRoles')
                        .query({ _testingRoles: `${RoleID.LIMITED_ACCESS}` })
                        .expect(403);
                });
            });
        });

        describe('grants access', () => {
            it('when role is in allowedRoles ', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .get('/rbac/users/specificRoles')
                        .query({ _testingRoles: `${RoleID.ALWAYS_ACCESS}` })
                        .expect(200)
                        .then((res) => {
                            expect(res.body?.data?.length).toBeGreaterThan(1);
                        });
                });
            });
        });
    });
});
