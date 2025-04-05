import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { needleStrings, seed, TestSeed } from '../prisma/seed';
import { RoleID } from '../src/authentication.middleware';
import { createTestingApp, multiAppTest } from './helpers';

describe('MustMatchAuthAttributePolicy e2e', () => {
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

    it('GET /must-match-auth-attribute/comments/everyone throws when unauthenticated (policy requires authentication)', async () => {
        await multiAppTest([nonStrictApp, strictApp], async (app) => {
            await request(app.getHttpServer())
                .get('/must-match-auth-attribute/comments/everyone')
                .expect(401);
        });
    });

    it('GET /must-match-auth-attribute/comments/everyone returns empty set when nothing matches', async () => {
        await multiAppTest([nonStrictApp, strictApp], async (app) => {
            await request(app.getHttpServer())
                .get('/must-match-auth-attribute/comments/everyone')
                .query({ _userId: `${Math.random()}` })
                .expect(200)
                .then((res) => {
                    expect(res.body?.data?.length).toEqual(0);
                });
        });
    });

    it('GET /must-match-auth-attribute/comments/everyone returns matching set when user attribute matches', async () => {
        await multiAppTest([nonStrictApp, strictApp], async (app) => {
            await request(app.getHttpServer())
                .get('/must-match-auth-attribute/comments/everyone')
                .query({ _userId: `${needleString0}` })
                .expect(200)
                .then((res) => {
                    expect(res.body?.data?.length).toEqual(1);
                });
        });
    });

    it('GET /must-match-auth-attribute/comments/anyRole returns matching set when user attribute matches', async () => {
        await multiAppTest([nonStrictApp, strictApp], async (app) => {
            await request(app.getHttpServer())
                .get('/must-match-auth-attribute/comments/anyRole')
                .query({
                    _userId: `${needleString0}`,
                    _testingRoles: [RoleID.LIMITED_ACCESS],
                })
                .expect(200)
                .then((res) => {
                    expect(res.body?.data?.length).toEqual(1);
                });
        });
    });

    it('GET /must-match-auth-attribute/comments/specificRoles returns matching set when user attribute and RBAC matches', async () => {
        await multiAppTest([nonStrictApp, strictApp], async (app) => {
            await request(app.getHttpServer())
                .get('/must-match-auth-attribute/comments/specificRoles')
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

    it('GET /must-match-auth-attribute/comments/specificRoles does NOT return matching set when RBAC criteria is not matched', async () => {
        await multiAppTest([nonStrictApp, strictApp], async (app) => {
            await request(app.getHttpServer())
                .get('/must-match-auth-attribute/comments/specificRoles')
                .query({
                    _userId: `${needleString0}`,
                    _testingRoles: [RoleID.LIMITED_ACCESS],
                })
                .expect(403);
        });
    });

    it("GET /must-match-auth-attribute/comments/everyone does not get overwritten by user's custom crudQuery", async () => {
        const needleString1 = userSeeds[1].id;
        await multiAppTest([nonStrictApp, strictApp], async (app) => {
            await request(app.getHttpServer())
                .get('/must-match-auth-attribute/comments/everyone')
                .query({
                    crudQuery: JSON.stringify({
                        where: {
                            post: { author: { id: needleString0 } },
                        },
                    }),
                    _userId: `${needleString1}`,
                    _testingRoles: [RoleID.LIMITED_ACCESS],
                })
                .expect(200)
                .then((res) => {
                    expect(res.body?.data?.length).toEqual(0);
                });
        });
    });

    describe('does not break when authDataAttributePath leads into falsy values', () => {
        it('throws error when null', async () => {
            await multiAppTest([nonStrictApp, strictApp], async (app) => {
                await request(app.getHttpServer())
                    .get('/must-match-auth-attribute/comments/everyone')
                    .query({
                        crudQuery: JSON.stringify({
                            where: {
                                post: { author: { id: needleString0 } },
                            },
                        }),
                        _userId: null,
                        _testingRoles: [RoleID.LIMITED_ACCESS],
                    })
                    .expect(500);
            });
        });

        it('throws error when undefined', async () => {
            await multiAppTest([nonStrictApp, strictApp], async (app) => {
                await request(app.getHttpServer())
                    .get('/must-match-auth-attribute/comments/everyone')
                    .query({
                        crudQuery: JSON.stringify({
                            where: {
                                post: { author: { id: needleString0 } },
                            },
                        }),
                        _testingRoles: [RoleID.LIMITED_ACCESS],
                    })
                    .expect(500);
            });
        });

        it('throws error when ""', async () => {
            await multiAppTest([nonStrictApp, strictApp], async (app) => {
                await request(app.getHttpServer())
                    .get('/must-match-auth-attribute/comments/everyone')
                    .query({
                        crudQuery: JSON.stringify({
                            where: {
                                post: { author: { id: needleString0 } },
                            },
                        }),
                        _userId: '',
                        _testingRoles: [RoleID.LIMITED_ACCESS],
                    })
                    .expect(500);
            });
        });

        it('throws error when 0', async () => {
            await multiAppTest([nonStrictApp, strictApp], async (app) => {
                await request(app.getHttpServer())
                    .get('/must-match-auth-attribute/comments/everyone')
                    .query({
                        crudQuery: JSON.stringify({
                            where: {
                                post: { author: { id: needleString0 } },
                            },
                        }),
                        _userId: 0,
                        _testingRoles: [RoleID.LIMITED_ACCESS],
                    })
                    .expect(500);
            });
        });
    });

    describe('works for PATCH and DELETE requests', () => {
        let testingComment;
        let testingComment_1;

        beforeEach(async () => {
            await request(nonStrictApp.getHttpServer())
                .get(`/must-match-auth-attribute/comments/everyone`)
                .query({ _userId: needleString0 })
                .then((res) => {
                    testingComment = res?.body?.data?.[0];
                });

            const needleString1 = userSeeds[1].id;
            await request(nonStrictApp.getHttpServer())
                .get(`/must-match-auth-attribute/comments/everyone`)
                .query({ _userId: needleString1 })
                .then((res) => {
                    testingComment_1 = res?.body?.data?.[0];
                });
        });

        describe('PATCH requests', () => {
            it('succeeds when the property matches', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    const changedTitle = `${Math.random()}`;
                    const payload = { title: changedTitle };

                    await request(app.getHttpServer())
                        .patch(`/must-match-auth-attribute/comments/everyone/${testingComment.id}`)
                        .query({ _userId: needleString0 })
                        .send(payload)
                        .expect(200)
                        .then((res) => {
                            expect(res.body?.title).toEqual(payload.title);
                        });
                });
            });

            it('throws when property does not match', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    const changedTitle = `${Math.random()}`;
                    const payload = { title: changedTitle };

                    await request(app.getHttpServer())
                        .patch(
                            `/must-match-auth-attribute/comments/everyone/${testingComment_1.id}`,
                        )
                        .query({ _userId: needleString0 })
                        .send(payload)
                        .expect(404);
                });
            });
        });

        describe('DELETE requests', () => {
            it('succeeds when the property matches', async () => {
                await request(nonStrictApp.getHttpServer())
                    .delete(`/must-match-auth-attribute/comments/everyone/${testingComment.id}`)
                    .query({ _userId: needleString0 })
                    .expect(200);

                await request(strictApp.getHttpServer())
                    .delete(`/must-match-auth-attribute/comments/everyone/${testingComment.id}`)
                    .query({ _userId: needleString0 })
                    .expect(404);
            });

            it('throws when property does not match', async () => {
                await multiAppTest([nonStrictApp, strictApp], async (app) => {
                    await request(app.getHttpServer())
                        .delete(
                            `/must-match-auth-attribute/comments/everyone/${testingComment_1.id}`,
                        )
                        .query({ _userId: needleString0 })
                        .expect(404);
                });
            });
        });
    });
});
