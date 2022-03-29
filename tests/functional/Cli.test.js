const { Cli, parseArgs } = require('../../lib/Cli');
const { Args, ARG_OPTIONS } = require('../../lib/Args');
const { NodeVersion } = require('../../lib/NodeVersion');

describe('CveDetails', () => {
    it('check version 1.8.4 from supplied args object', async () => {
        const args = new Args();
        args[ARG_OPTIONS.NODE_VERSION] = '1.8.4';
        args[ARG_OPTIONS.NO_UPDATE] = true;
        const results = await Cli.run(args);
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
        process.argv[2] = '--version=1.8.4';
        process.argv[3] = '--no-update';
        const results = await Cli.run(parseArgs());
        expect(results).toBeDefined();
        expect(results.auditVersion).toEqual(NodeVersion.fromString('1.8.4'));
    });
});
