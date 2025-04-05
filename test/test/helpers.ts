import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule, StrictModeAppModule } from '../src/app.module';

/**
 * Useful when same test must be run across different apps
 */
export async function multiAppTest(apps: any[], testFn: (app: any) => Promise<any>) {
    const results = [];
    for (const app of apps) {
        const result = await testFn(app);
        results.push(result);
    }
    return results;
}

export async function createTestingApp(opts: { strict: boolean }) {
    const appModule = opts.strict ? StrictModeAppModule : AppModule;
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [appModule],
    }).compile();

    const app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.set('query parser', 'extended');
    return app;
}
