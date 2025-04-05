import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { needleStrings, seed, TestSeed } from '../prisma/seed';
import { CommentsModule, InvalidCommentsModule } from '../src/comments/comments.module';
import { createTestingApp } from './helpers';

/**
 * This test outlines the added sane defaults to help developers with the more common careless mistakes
 */
describe('Misuse resistance', () => {
    let app: NestExpressApplication;
    let userSeeds: TestSeed[];
    let [seededUser0] = [] as TestSeed[];
    const [needleString0] = needleStrings;

    beforeAll(async () => {
        app = await createTestingApp({ strict: true });
        await app.init();
    });

    beforeEach(async () => {
        try {
            userSeeds = await seed(true);
            [seededUser0] = userSeeds;
        } catch (e) {
            console.log(`Error during beforeEach: ${e.message || e}`);
        }
    });

    afterAll(async () => {
        app.close();
    });

    describe('when no policies provided and strictMode: true', () => {
        it('POST /users throws 501', () => {
            const now = Date.now();
            const stringNow = String(now);
            return request(app.getHttpServer())
                .post('/users')
                .send({
                    email: stringNow,
                    posts: [
                        {
                            title: stringNow,
                            comments: [
                                {
                                    title: stringNow,
                                },
                            ],
                        },
                    ],
                    profile: {
                        fullName: stringNow,
                    },
                })
                .expect(501);
        });

        it('GET /users throws 501', () => {
            return request(app.getHttpServer()).get('/users').expect(501);
        });

        it('GET /users/id throws 501', () => {
            return request(app.getHttpServer()).get(`/users/${needleString0}`).expect(501);
        });

        it('PATCH /users/id throws 501', async () => {
            const changedName = `${needleString0}aaa`;
            const { posts, profile, ...shallowPayload } = seededUser0;
            shallowPayload.name = changedName;
            await request(app.getHttpServer())
                .patch(`/users/${needleString0}`)
                .send(shallowPayload)
                .expect(501);
        });

        it('DELETE /comments/id throws 501', async () => {
            await request(app.getHttpServer()).delete(`/comments/${needleString0}`).expect(501);
        });
    });

    describe('defaultJoins', () => {
        it('Developers receive error messages when misusing defaultJoins', async () => {
            await expect(async () => {
                const validModuleFixture: TestingModule = await Test.createTestingModule({
                    imports: [CommentsModule],
                }).compile();
                validModuleFixture.createNestApplication();
            }).resolves;

            await expect(async () => {
                const invalidModuleFixture: TestingModule = await Test.createTestingModule({
                    imports: [InvalidCommentsModule],
                }).compile();
                invalidModuleFixture.createNestApplication();
            }).rejects.toBeTruthy();
        });
    });
});
