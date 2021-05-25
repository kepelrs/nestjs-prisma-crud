import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { dummySeedFullObj, dummySeedValueString, seed } from '../prisma/seed';
import { AppModule, StrictModeAppModule } from '../src/app.module';
import { RoleID } from '../src/authentication.middleware';

describe('AccessPolicy RBAC e2e', () => {
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

    it('GET /rbac/users/everyone grants resources although unauthenticated', async () => {
        await request(app.getHttpServer())
            .get('/rbac/users/everyone')
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toBeGreaterThan(1);
            });

        await request(strictApp.getHttpServer())
            .get('/rbac/users/everyone')
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toBeGreaterThan(1);
            });
    });

    it('GET /rbac/users/everyone grants resources when role is ALWAYS_ACCESS', async () => {
        await request(app.getHttpServer())
            .get('/rbac/users/everyone')
            .query({ _testingRoles: `${RoleID.ALWAYS_ACCESS}` })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toBeGreaterThan(1);
            });

        await request(strictApp.getHttpServer())
            .get('/rbac/users/everyone')
            .query({ _testingRoles: `${RoleID.ALWAYS_ACCESS}` })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toBeGreaterThan(1);
            });
    });

    it('GET /rbac/users/everyone grants resources when role is LIMITED_ACCESS', async () => {
        await request(app.getHttpServer())
            .get('/rbac/users/everyone')
            .query({ _testingRoles: `${RoleID.LIMITED_ACCESS}` })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toBeGreaterThan(1);
            });

        await request(strictApp.getHttpServer())
            .get('/rbac/users/everyone')
            .query({ _testingRoles: `${RoleID.LIMITED_ACCESS}` })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toBeGreaterThan(1);
            });
    });

    it('GET /rbac/users/anyAuthenticated does NOT grant resources when client is unauthenticated', async () => {
        await request(app.getHttpServer()).get('/rbac/users/anyAuthenticated').expect(401);

        await request(strictApp.getHttpServer()).get('/rbac/users/anyAuthenticated').expect(401);
    });

    it('GET /rbac/users/anyAuthenticated does grant resources when role is ALWAYS_ACCESS', async () => {
        await request(app.getHttpServer())
            .get('/rbac/users/anyAuthenticated')
            .query({ _testingRoles: `${RoleID.ALWAYS_ACCESS}` })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toBeGreaterThan(1);
            });

        await request(strictApp.getHttpServer())
            .get('/rbac/users/anyAuthenticated')
            .query({ _testingRoles: `${RoleID.ALWAYS_ACCESS}` })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toBeGreaterThan(1);
            });
    });

    it('GET /rbac/users/anyAuthenticated does grant resources when role is LIMITED_ACCESS (anyAuthenticated after all)', async () => {
        await request(app.getHttpServer())
            .get('/rbac/users/anyAuthenticated')
            .query({ _testingRoles: `${RoleID.LIMITED_ACCESS}` })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toBeGreaterThan(1);
            });

        await request(strictApp.getHttpServer())
            .get('/rbac/users/anyAuthenticated')
            .query({ _testingRoles: `${RoleID.LIMITED_ACCESS}` })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toBeGreaterThan(1);
            });
    });

    it('GET /rbac/users/specificRoles does NOT grant resources when role is LIMITED_ACCESS ', async () => {
        await request(app.getHttpServer()).get('/rbac/users/specificRoles').expect(401);

        await request(strictApp.getHttpServer()).get('/rbac/users/specificRoles').expect(401);
    });

    it('GET /rbac/users/specificRoles does grant resources when role is ALWAYS_ACCESS ', async () => {
        await request(app.getHttpServer())
            .get('/rbac/users/specificRoles')
            .query({ _testingRoles: `${RoleID.ALWAYS_ACCESS}` })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toBeGreaterThan(1);
            });

        await request(strictApp.getHttpServer())
            .get('/rbac/users/specificRoles')
            .query({ _testingRoles: `${RoleID.ALWAYS_ACCESS}` })
            .expect(200)
            .then((res) => {
                expect(res.body?.data?.length).toBeGreaterThan(1);
            });
    });

    it('GET /rbac/users/specificRoles does NOT grant resources when role is LIMITED_ACCESS ', async () => {
        await request(app.getHttpServer())
            .get('/rbac/users/specificRoles')
            .query({ _testingRoles: `${RoleID.LIMITED_ACCESS}` })
            .expect(403);

        await request(strictApp.getHttpServer())
            .get('/rbac/users/specificRoles')
            .query({ _testingRoles: `${RoleID.LIMITED_ACCESS}` })
            .expect(403);
    });
});
