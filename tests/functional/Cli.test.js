const { Cli } = require('../../lib/Cli');
const { NodeVersion } = require('../../lib/NodeVersion');

describe('Cli', () => {
    it('check version 1.8.4 from supplied args object', async () => {
        const args = [null, null, '--version=1.8.4', '--no-update'];
        const cli = new Cli(args);
        const results = await cli.run();
        expect(results).toBeDefined();
        expect(results.auditVersion).toEqual(NodeVersion.fromString('1.8.4'));
        expect(results.hasVulnerabilities()).toBe(false);
        expect(results.hasSupport()).toBe(false);
        expect(results.supportType).toEqual('none');
        expect(results.isLatestPatchVersion()).toBe(true);
        expect(results.isLatestMinorVersion()).toBe(true);
        expect(results.isLatestVersion()).toBe(false);
        expect(results.latestPatchVersion).toEqual(NodeVersion.fromString('1.8.4'));
        expect(results.latestMinorVersion).toEqual(NodeVersion.fromString('1.8.4'));
        expect(results.latestVersion).toBeDefined();
        expect(results.activeSupportEndDate).toBeNull();
        expect(results.supportEndDate).toBeNull();
        expect(results.rulesLastUpdatedDate).toBeTruthy();
        expect(results.vulnerabilities).toBeDefined();
        expect(Object.keys(results.vulnerabilities).length).toBe(0);
    });

    it('check version 1.8.4 from argv', async () => {
        const args = [null, null, '--version=1.8.4', '--no-update'];
        const cli = new Cli(args);
        const results = await cli.run();
        expect(results).toBeDefined();
        expect(results.auditVersion).toEqual(NodeVersion.fromString('1.8.4'));
    });
});
