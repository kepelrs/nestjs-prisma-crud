import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { dummySeedFullObj, dummySeedValueString, seed } from '../prisma/seed';
import { StrictModeAppModule } from '../src/app.module';
import { CommentsModule, InvalidCommentsModule } from '../src/comments/comments.module';

/**
 * This test outlines the added sane defaults to help developers with the more common careless mistakes
 */
describe('Misuse resistance', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [StrictModeAppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
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
    });

    it('POST /users throws 501 when no policies provided and strictMode: true', () => {
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

    it('GET /users throws 501 when no policies provided and strictMode: true', () => {
        return request(app.getHttpServer()).get('/users').expect(501);
    });

    it('GET /users/id throws 501 when no policies provided and strictMode: true', () => {
        return request(app.getHttpServer()).get(`/users/${dummySeedValueString}`).expect(501);
    });

    it('PATCH /users/id throws 501 when no policies provided and strictMode: true', async () => {
        const changedName = `${dummySeedValueString}aaa`;
        const { posts, profile, ...shallowPayload } = dummySeedFullObj;
        shallowPayload.name = changedName;
        await request(app.getHttpServer())
            .patch(`/users/${dummySeedValueString}`)
            .send(shallowPayload)
            .expect(501);
    });

    it('DELETE /comments/id throws 501 when no policies provided and strictMode: true', async () => {
        await request(app.getHttpServer()).delete(`/comments/${dummySeedValueString}`).expect(501);
    });

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
