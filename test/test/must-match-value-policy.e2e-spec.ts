import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { needleStrings, seed, TestSeed } from '../prisma/seed';
import { RoleID } from '../src/authentication.middleware';
import { createTestingApp, multiAppTest } from './helpers';

describe('MustMatchValue e2e', () => {
    let nonStrictApp: NestExpressApplication;
    let strictApp: NestExpressApplication;
    let testingComment;
    let testingComment_1;
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

        // Load test comments (ids change on every seed)
        testingComment = userSeeds[0].posts[0].comments[0];
        testingComment_1 = userSeeds[1].posts[0].comments[0];
    });

    afterAll(async () => {
        nonStrictApp.close();
        strictApp.close();
    });

    describe('General behavior', () => {
        it('throws error when targetValue is null', async () => {
            await multiAppTest([nonStrictApp, strictApp], async (app) => {
                await request(app.getHttpServer())
                    .get('/must-match-value/comments/everyone/null')
                    .query({
                        _userId: needleString0,
                        _testingRoles: [RoleID.LIMITED_ACCESS],
                    })
                    .expect(500);
            });
        });

        it("GET /must-match-value/comments/everyone does not get overwritten by user's custom crudQuery", async () => {
            await multiAppTest([nonStrictApp, strictApp], async (app) => {
                await request(app.getHttpServer())
                    .get('/must-match-value/comments/everyone')
                    .query({
                        crudQuery: JSON.stringify({
                            where: {
                                id: testingComment_1.id,
                            },
                        }),
                        _userId: `${needleString0}`,
                        _testingRoles: [RoleID.LIMITED_ACCESS],
                    })
                    .expect(200)
                    .then((res) => {
                        expect(res.body?.data?.length).toEqual(0);
                    });
            });
        });
    });

    describe('Works with different RBAC configurations', () => {
        describe('everyone', () => {
            it('GET /must-match-value/comments/everyone succeeds even when unauthenticated (policy does not consume authData)', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .get('/must-match-value/comments/everyone')
                        .expect(200)
                        .then((res) => {
                            expect(res.body?.data?.length).toEqual(1);
                            expect(res.body?.data?.[0].id).toEqual(testingComment.id);
                        });
                });
            });

            it('GET /must-match-value/comments/everyone/empty returns empty set when nothing matches', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .get('/must-match-value/comments/everyone/empty')
                        .expect(200)
                        .then((res) => {
                            expect(res.body?.data?.length).toEqual(0);
                        });
                });
            });
        });

        describe('anyRole', () => {
            it('GET /must-match-value/comments/anyRole returns only matching set', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .get('/must-match-value/comments/anyRole')
                        .query({
                            _userId: `${needleString0}`,
                            _testingRoles: [RoleID.LIMITED_ACCESS],
                        })
                        .expect(200)
                        .then((res) => {
                            expect(res.body?.data?.length).toEqual(1);
                            expect(res.body?.data?.[0].id).toEqual(testingComment.id);
                        });
                });
            });

            it('GET /must-match-value/comments/anyRole/empty returns empty set when nothing matches', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .get('/must-match-value/comments/anyRole/empty')
                        .query({
                            _userId: `${needleString0}`,
                            _testingRoles: [RoleID.LIMITED_ACCESS],
                        })
                        .expect(200)
                        .then((res) => {
                            expect(res.body?.data?.length).toEqual(0);
                        });
                });
            });
        });

        describe('specificRoles', () => {
            it('GET /must-match-value/comments/specificRoles returns only matching set', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .get('/must-match-value/comments/specificRoles')
                        .query({
                            _userId: `${needleString0}`,
                            _testingRoles: [RoleID.ALWAYS_ACCESS],
                        })
                        .expect(200)
                        .then((res) => {
                            expect(res.body?.data?.length).toEqual(1);
                        });
                });
            });

            it('GET /must-match-value/comments/specificRoles does not override RBAC policy', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .get('/must-match-value/comments/specificRoles')
                        .query({
                            _userId: `${needleString0}`,
                            _testingRoles: [RoleID.LIMITED_ACCESS],
                        })
                        .expect(403);
                });
            });
        });
    });

    describe('works for PATCH and DELETE requests', () => {
        describe('PATCH requests', () => {
            it('succeeds when the property matches', async () => {
                const changedTitle = `${Math.random()}`;
                const payload = { title: changedTitle };
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .patch(`/must-match-value/comments/everyone/${testingComment.id}`)
                        .query({ _userId: needleString0 })
                        .send(payload)
                        // .expect(200)
                        .then((res) => {
                            expect(res.body?.title).toEqual(payload.title);
                        });
                });
            });

            it('throws when property does not match', async () => {
                const changedTitle = `${Math.random()}`;
                const payload = { title: changedTitle };
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .patch(`/must-match-value/comments/everyone/${testingComment_1.id}`)
                        .query({ _userId: needleString0 })
                        .send(payload)
                        .expect(404);
                });
            });
        });

        describe('DELETE requests', () => {
            it('succeeds when the property matches', async () => {
                await request(nonStrictApp.getHttpServer())
                    .delete(`/must-match-value/comments/everyone/${testingComment.id}`)
                    .query({ _userId: needleString0 })
                    .expect(200);
                await request(strictApp.getHttpServer())
                    .delete(`/must-match-value/comments/everyone/${testingComment.id}`)
                    .query({ _userId: needleString0 })
                    .expect(404);
            });
            it('throws when property does not match', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .delete(`/must-match-value/comments/everyone/${testingComment_1.id}`)
                        .query({ _userId: needleString0 })
                        .expect(404);
                });
            });
        });
    });
});
