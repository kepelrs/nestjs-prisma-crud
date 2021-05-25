import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { dummySeedValueString, seed } from '../prisma/seed';
import { AppModule, StrictModeAppModule } from '../src/app.module';
import { RoleID } from '../src/authentication.middleware';

describe('MustMatchValue e2e', () => {
    let app: INestApplication;
    let strictApp: INestApplication;
    let testingComment;
    let testingComment_1;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        const strictModuleFixture: TestingModule = await Test.createTestingModule({
            imports: [StrictModeAppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        strictApp = strictModuleFixture.createNestApplication();
        await app.init();
        await strictApp.init();
    });

    beforeEach(async () => {
        try {
            await seed(true);
        } catch (e) {
            console.log(`Error during beforeEach: ${e.message || e}`);
        }

        // Load comments (ids change on every seed)
        await request(app.getHttpServer())
            .get(`/must-match-auth-attribute/comments/everyone`) // TODO: decouple this
            .query({ _userId: dummySeedValueString })
            .then((res) => {
                testingComment = res?.body?.data?.[0];
            });
        const dummySeedValueString_1 = `${dummySeedValueString.slice(0, -1)}1`;
        await request(app.getHttpServer())
            .get(`/must-match-auth-attribute/comments/everyone`) // TODO: decouple this
            .query({ _userId: dummySeedValueString_1 })
            .then((res) => {
                testingComment_1 = res?.body?.data?.[0];
            });
    });

    afterAll(async () => {
        app.close();
        strictApp.close();
    });

    describe('General behavior', () => {
        it('throws error when targetValue is null', async () => {
            await request(app.getHttpServer())
                .get('/must-match-value/comments/everyone/null')
                .query({
                    _userId: dummySeedValueString,
                    _testingRoles: [RoleID.LIMITED_ACCESS],
                })
                .expect(500);
            await request(strictApp.getHttpServer())
                .get('/must-match-value/comments/everyone/null')
                .query({
                    _userId: dummySeedValueString,
                    _testingRoles: [RoleID.LIMITED_ACCESS],
                })
                .expect(500);
        });

        it("GET /must-match-value/comments/everyone does not get overwritten by user's custom crudQ", async () => {
            await request(app.getHttpServer())
                .get('/must-match-value/comments/everyone')
                .query({
                    crudQ: JSON.stringify({
                        where: {
                            id: testingComment_1.id,
                        },
                    }),
                    _userId: `${dummySeedValueString}`,
                    _testingRoles: [RoleID.LIMITED_ACCESS],
                })
                .expect(200)
                .then((res) => {
                    expect(res.body?.data?.length).toEqual(0);
                });

            await request(strictApp.getHttpServer())
                .get('/must-match-value/comments/everyone')
                .query({
                    crudQ: JSON.stringify({
                        where: {
                            id: testingComment_1.id,
                        },
                    }),
                    _userId: `${dummySeedValueString}`,
                    _testingRoles: [RoleID.LIMITED_ACCESS],
                })
                .expect(200)
                .then((res) => {
                    expect(res.body?.data?.length).toEqual(0);
                });
        });
    });

    describe('Works with different RBAC configurations', () => {
        describe('everyone', () => {
            it('GET /must-match-value/comments/everyone succeeds even when unauthenticated (policy does not consume authData)', async () => {
                await request(app.getHttpServer())
                    .get('/must-match-value/comments/everyone')
                    .expect(200)
                    .then((res) => {
                        expect(res.body?.data?.length).toEqual(1);
                        expect(res.body?.data?.[0].id).toEqual(testingComment.id);
                    });

                await request(strictApp.getHttpServer())
                    .get('/must-match-value/comments/everyone')
                    .expect(200)
                    .then((res) => {
                        expect(res.body?.data?.length).toEqual(1);
                        expect(res.body?.data?.[0].id).toEqual(testingComment.id);
                    });
            });

            it('GET /must-match-value/comments/everyone/empty returns empty set when nothing matches', async () => {
                await request(app.getHttpServer()) // TODO: DRY up duplicate code for testing app/strictApp in most places
                    .get('/must-match-value/comments/everyone/empty')
                    .expect(200)
                    .then((res) => {
                        expect(res.body?.data?.length).toEqual(0);
                    });

                await request(strictApp.getHttpServer())
                    .get('/must-match-value/comments/everyone/empty')
                    .expect(200)
                    .then((res) => {
                        expect(res.body?.data?.length).toEqual(0);
                    });
            });
        });

        describe('anyAuthenticated', () => {
            it('GET /must-match-value/comments/anyAuthenticated returns only matching set', async () => {
                await request(app.getHttpServer())
                    .get('/must-match-value/comments/anyAuthenticated')
                    .query({
                        _userId: `${dummySeedValueString}`,
                        _testingRoles: [RoleID.LIMITED_ACCESS],
                    })
                    .expect(200)
                    .then((res) => {
                        expect(res.body?.data?.length).toEqual(1);
                        expect(res.body?.data?.[0].id).toEqual(testingComment.id);
                    });

                await request(strictApp.getHttpServer())
                    .get('/must-match-value/comments/anyAuthenticated')
                    .query({
                        _userId: `${dummySeedValueString}`,
                        _testingRoles: [RoleID.LIMITED_ACCESS],
                    })
                    .expect(200)
                    .then((res) => {
                        expect(res.body?.data?.length).toEqual(1);
                        expect(res.body?.data?.[0].id).toEqual(testingComment.id);
                    });
            });

            it('GET /must-match-value/comments/anyAuthenticated/empty returns empty set when nothing matches', async () => {
                await request(app.getHttpServer())
                    .get('/must-match-value/comments/anyAuthenticated/empty')
                    .query({
                        _userId: `${dummySeedValueString}`,
                        _testingRoles: [RoleID.LIMITED_ACCESS],
                    })
                    .expect(200)
                    .then((res) => {
                        expect(res.body?.data?.length).toEqual(0);
                    });

                await request(strictApp.getHttpServer())
                    .get('/must-match-value/comments/anyAuthenticated/empty')
                    .query({
                        _userId: `${dummySeedValueString}`,
                        _testingRoles: [RoleID.LIMITED_ACCESS],
                    })
                    .expect(200)
                    .then((res) => {
                        expect(res.body?.data?.length).toEqual(0);
                    });
            });
        });

        describe('specificRoles', () => {
            it('GET /must-match-value/comments/specificRoles returns only matching set', async () => {
                await request(app.getHttpServer())
                    .get('/must-match-value/comments/specificRoles')
                    .query({
                        _userId: `${dummySeedValueString}`,
                        _testingRoles: [RoleID.ALWAYS_ACCESS],
                    })
                    .expect(200)
                    .then((res) => {
                        expect(res.body?.data?.length).toEqual(1);
                    });

                await request(strictApp.getHttpServer())
                    .get('/must-match-value/comments/specificRoles')
                    .query({
                        _userId: `${dummySeedValueString}`,
                        _testingRoles: [RoleID.ALWAYS_ACCESS],
                    })
                    .expect(200)
                    .then((res) => {
                        expect(res.body?.data?.length).toEqual(1);
                    });
            });

            it('GET /must-match-value/comments/specificRoles does not override RBAC policy', async () => {
                await request(app.getHttpServer())
                    .get('/must-match-value/comments/specificRoles')
                    .query({
                        _userId: `${dummySeedValueString}`,
                        _testingRoles: [RoleID.LIMITED_ACCESS],
                    })
                    .expect(403);

                await request(strictApp.getHttpServer())
                    .get('/must-match-value/comments/specificRoles')
                    .query({
                        _userId: `${dummySeedValueString}`,
                        _testingRoles: [RoleID.LIMITED_ACCESS],
                    })
                    .expect(403);
            });
        });
    });

    describe('works for PATCH and DELETE requests', () => {
        describe('PATCH requests', () => {
            it('succeeds when the property matches', async () => {
                let changedTitle = `${Math.random()}`;
                let payload = { title: changedTitle };
                await request(app.getHttpServer())
                    .patch(`/must-match-value/comments/everyone/${testingComment.id}`)
                    .query({ _userId: dummySeedValueString })
                    .send(payload)
                    .expect(200)
                    .then((res) => {
                        expect(res.body?.title).toEqual(payload.title);
                    });
                changedTitle = `${Math.random()}`;
                payload = { title: changedTitle };
                await request(strictApp.getHttpServer())
                    .patch(`/must-match-value/comments/everyone/${testingComment.id}`)
                    .query({ _userId: dummySeedValueString })
                    .send(payload)
                    .expect(200)
                    .then((res) => {
                        expect(res.body?.title).toEqual(payload.title);
                    });
            });

            it('throws when property does not match', async () => {
                let changedTitle = `${Math.random()}`;
                let payload = { title: changedTitle };
                await request(app.getHttpServer())
                    .patch(`/must-match-value/comments/everyone/${testingComment_1.id}`)
                    .query({ _userId: dummySeedValueString })
                    .send(payload)
                    .expect(404);
                changedTitle = `${Math.random()}`;
                payload = { title: changedTitle };
                await request(strictApp.getHttpServer())
                    .patch(`/must-match-value/comments/everyone/${testingComment_1.id}`)
                    .query({ _userId: dummySeedValueString })
                    .send(payload)
                    .expect(404);
            });
        });

        describe('DELETE requests', () => {
            it('succeeds when the property matches', async () => {
                await request(app.getHttpServer())
                    .delete(`/must-match-value/comments/everyone/${testingComment.id}`)
                    .query({ _userId: dummySeedValueString })
                    .expect(200);
                await request(strictApp.getHttpServer())
                    .delete(`/must-match-value/comments/everyone/${testingComment.id}`)
                    .query({ _userId: dummySeedValueString })
                    .expect(404);
            });
            it('throws when property does not match', async () => {
                await request(app.getHttpServer())
                    .delete(`/must-match-value/comments/everyone/${testingComment_1.id}`)
                    .query({ _userId: dummySeedValueString })
                    .expect(404);
                await request(strictApp.getHttpServer())
                    .delete(`/must-match-value/comments/everyone/${testingComment_1.id}`)
                    .query({ _userId: dummySeedValueString })
                    .expect(404);
            });
        });
    });
});
