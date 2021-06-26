/**
 * Useful when same test must be run across different apps
 */
export async function multiAppTest(apps: any[], testFn: (app: any) => Promise<any>) {
    return Promise.all(apps.map(async (app) => testFn(app)));
}
