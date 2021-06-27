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
