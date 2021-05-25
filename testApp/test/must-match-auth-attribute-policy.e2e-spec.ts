import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { dummySeedValueString, seed } from '../prisma/seed';
import { AppModule, StrictModeAppModule } from '../src/app.module';
import { RoleID } from '../src/authentication.middleware';

describe('MustMatchAuthAttributePolicy e2e', () => {
    let app: INestApplication;
    let strictApp: INestApplication;

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
    });

    afterAll(async () => {
        app.close();
        strictApp.close();
    });

    it('GET /must-match-auth-attribute/comments/everyone throws when unauthenticated (policy requires authentication)', async () => {
        await request(app.getHttpServer())
            .get('/must-match-auth-attribute/comments/everyone')
            .expect(401);

        await request(strictApp.getHttpServer())
            .get('/must-match-auth-attribute/comments/everyone')
            .expect(401);
    });

    it('GET /must-match-auth-attribute/comments/everyone returns empty set when nothing matches', async () => {
        await request(app.getHttpServer()) // TODO: DRY up duplicate code for testing app/strictApp in most places
            .get('/must-match-auth-attribute/comments/everyone')
            .query({ _userId: `${Math.random()}` })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toEqual(0);
            });

        await request(strictApp.getHttpServer())
            .get('/must-match-auth-attribute/comments/everyone')
            .query({ _userId: `${Math.random()}` })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toEqual(0);
            });
    });

    it('GET /must-match-auth-attribute/comments/everyone returns matching set when user attribute matches', async () => {
        await request(app.getHttpServer())
            .get('/must-match-auth-attribute/comments/everyone')
            .query({ _userId: `${dummySeedValueString}` })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toEqual(1);
            });

        await request(strictApp.getHttpServer())
            .get('/must-match-auth-attribute/comments/everyone')
            .query({ _userId: `${dummySeedValueString}` })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toEqual(1);
            });
    });

    it('GET /must-match-auth-attribute/comments/anyAuthenticated returns matching set when user attribute matches', async () => {
        await request(app.getHttpServer())
            .get('/must-match-auth-attribute/comments/anyAuthenticated')
            .query({
                _userId: `${dummySeedValueString}`,
                _testingRoles: [RoleID.LIMITED_ACCESS],
            })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toEqual(1);
            });

        await request(strictApp.getHttpServer())
            .get('/must-match-auth-attribute/comments/anyAuthenticated')
            .query({
                _userId: `${dummySeedValueString}`,
                _testingRoles: [RoleID.LIMITED_ACCESS],
            })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toEqual(1);
            });
    });

    it('GET /must-match-auth-attribute/comments/specificRoles returns matching set when user attribute and RBAC matches', async () => {
        await request(app.getHttpServer())
            .get('/must-match-auth-attribute/comments/specificRoles')
            .query({
                _userId: `${dummySeedValueString}`,
                _testingRoles: [RoleID.ALWAYS_ACCESS],
            })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toEqual(1);
            });

        await request(strictApp.getHttpServer())
            .get('/must-match-auth-attribute/comments/specificRoles')
            .query({
                _userId: `${dummySeedValueString}`,
                _testingRoles: [RoleID.ALWAYS_ACCESS],
            })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toEqual(1);
            });
    });

    it('GET /must-match-auth-attribute/comments/specificRoles does NOT return matching set when RBAC criteria is not matched', async () => {
        await request(app.getHttpServer())
            .get('/must-match-auth-attribute/comments/specificRoles')
            .query({
                _userId: `${dummySeedValueString}`,
                _testingRoles: [RoleID.LIMITED_ACCESS],
            })
            .expect(403);

        await request(strictApp.getHttpServer())
            .get('/must-match-auth-attribute/comments/specificRoles')
            .query({
                _userId: `${dummySeedValueString}`,
                _testingRoles: [RoleID.LIMITED_ACCESS],
            })
            .expect(403);
    });

    it("GET /must-match-auth-attribute/comments/everyone does not get overwritten by user's custom crudQ", async () => {
        const dummySeedValueString_1 = `${dummySeedValueString.slice(0, -1)}1`; // TODO: Refactor _1 make this more readable
        await request(app.getHttpServer())
            .get('/must-match-auth-attribute/comments/everyone')
            .query({
                crudQ: JSON.stringify({
                    where: {
                        post: { author: { id: dummySeedValueString } },
                    },
                }),
                _userId: `${dummySeedValueString_1}`,
                _testingRoles: [RoleID.LIMITED_ACCESS],
            })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toEqual(0);
            });

        await request(strictApp.getHttpServer())
            .get('/must-match-auth-attribute/comments/everyone')
            .query({
                crudQ: JSON.stringify({
                    where: {
                        post: { author: { id: dummySeedValueString } },
                    },
                }),
                _userId: `${dummySeedValueString_1}`,
                _testingRoles: [RoleID.LIMITED_ACCESS],
            })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toEqual(0);
            });
    });

    describe('does not break when authDataAttributePath leads into falsy values', () => {
        it('throws error when null', async () => {
            await request(app.getHttpServer())
                .get('/must-match-auth-attribute/comments/everyone')
                .query({
                    crudQ: JSON.stringify({
                        where: {
                            post: { author: { id: dummySeedValueString } },
                        },
                    }),
                    _userId: null,
                    _testingRoles: [RoleID.LIMITED_ACCESS],
                })
                .expect(500);

            await request(strictApp.getHttpServer())
                .get('/must-match-auth-attribute/comments/everyone')
                .query({
                    crudQ: JSON.stringify({
                        where: {
                            post: { author: { id: dummySeedValueString } },
                        },
                    }),
                    _userId: null,
                    _testingRoles: [RoleID.LIMITED_ACCESS],
                })
                .expect(500);
        });

        it('throws error when undefined', async () => {
            await request(app.getHttpServer())
                .get('/must-match-auth-attribute/comments/everyone')
                .query({
                    crudQ: JSON.stringify({
                        where: {
                            post: { author: { id: dummySeedValueString } },
                        },
                    }),
                    _testingRoles: [RoleID.LIMITED_ACCESS],
                })
                .expect(500);

            await request(strictApp.getHttpServer())
                .get('/must-match-auth-attribute/comments/everyone')
                .query({
                    crudQ: JSON.stringify({
                        where: {
                            post: { author: { id: dummySeedValueString } },
                        },
                    }),
                    _testingRoles: [RoleID.LIMITED_ACCESS],
                })
                .expect(500);
        });

        it('throws error when ""', async () => {
            await request(app.getHttpServer())
                .get('/must-match-auth-attribute/comments/everyone')
                .query({
                    crudQ: JSON.stringify({
                        where: {
                            post: { author: { id: dummySeedValueString } },
                        },
                    }),
                    _userId: '',
                    _testingRoles: [RoleID.LIMITED_ACCESS],
                })
                .expect(500);

            await request(strictApp.getHttpServer())
                .get('/must-match-auth-attribute/comments/everyone')
                .query({
                    crudQ: JSON.stringify({
                        where: {
                            post: { author: { id: dummySeedValueString } },
                        },
                    }),
                    _userId: '',
                    _testingRoles: [RoleID.LIMITED_ACCESS],
                })
                .expect(500);
        });

        it('throws error when 0', async () => {
            await request(app.getHttpServer())
                .get('/must-match-auth-attribute/comments/everyone')
                .query({
                    crudQ: JSON.stringify({
                        where: {
                            post: { author: { id: dummySeedValueString } },
                        },
                    }),
                    _userId: 0,
                    _testingRoles: [RoleID.LIMITED_ACCESS],
                })
                .expect(500);

            await request(strictApp.getHttpServer())
                .get('/must-match-auth-attribute/comments/everyone')
                .query({
                    crudQ: JSON.stringify({
                        where: {
                            post: { author: { id: dummySeedValueString } },
                        },
                    }),
                    _userId: 0,
                    _testingRoles: [RoleID.LIMITED_ACCESS],
                })
                .expect(500);
        });
    });

    describe('works for PATCH and DELETE requests', () => {
        let testingComment;
        let testingComment_1;
        beforeEach(async () => {
            await request(app.getHttpServer())
                .get(`/must-match-auth-attribute/comments/everyone`)
                .query({ _userId: dummySeedValueString })
                .then((res) => {
                    testingComment = res?.body?.data?.[0];
                });

            const dummySeedValueString_1 = `${dummySeedValueString.slice(0, -1)}1`;
            await request(app.getHttpServer())
                .get(`/must-match-auth-attribute/comments/everyone`)
                .query({ _userId: dummySeedValueString_1 })
                .then((res) => {
                    testingComment_1 = res?.body?.data?.[0];
                });
        });

        describe('PATCH requests', () => {
            it('succeeds when the property matches', async () => {
                let changedTitle = `${Math.random()}`;
                let payload = { title: changedTitle };

                await request(app.getHttpServer())
                    .patch(`/must-match-auth-attribute/comments/everyone/${testingComment.id}`)
                    .query({ _userId: dummySeedValueString })
                    .send(payload)
                    .expect(200)
                    .then((res) => {
                        expect(res.body?.title).toEqual(payload.title);
                    });

                changedTitle = `${Math.random()}`;
                payload = { title: changedTitle };
                await request(strictApp.getHttpServer())
                    .patch(`/must-match-auth-attribute/comments/everyone/${testingComment.id}`)
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
                    .patch(`/must-match-auth-attribute/comments/everyone/${testingComment_1.id}`)
                    .query({ _userId: dummySeedValueString })
                    .send(payload)
                    .expect(404);

                changedTitle = `${Math.random()}`;
                payload = { title: changedTitle };
                await request(strictApp.getHttpServer())
                    .patch(`/must-match-auth-attribute/comments/everyone/${testingComment_1.id}`)
                    .query({ _userId: dummySeedValueString })
                    .send(payload)
                    .expect(404);
            });
        });

        describe('DELETE requests', () => {
            it('succeeds when the property matches', async () => {
                await request(app.getHttpServer())
                    .delete(`/must-match-auth-attribute/comments/everyone/${testingComment.id}`)
                    .query({ _userId: dummySeedValueString })
                    .expect(200);

                await request(strictApp.getHttpServer())
                    .delete(`/must-match-auth-attribute/comments/everyone/${testingComment.id}`)
                    .query({ _userId: dummySeedValueString })
                    .expect(404);
            });

            it('throws when property does not match', async () => {
                await request(app.getHttpServer())
                    .delete(`/must-match-auth-attribute/comments/everyone/${testingComment_1.id}`)
                    .query({ _userId: dummySeedValueString })
                    .expect(404);

                await request(strictApp.getHttpServer())
                    .delete(`/must-match-auth-attribute/comments/everyone/${testingComment_1.id}`)
                    .query({ _userId: dummySeedValueString })
                    .expect(404);
            });
        });
    });

    // TODO: Restructure all tests (other files as well) with more describes groups for better organization and readability
});
