const { Changelogs } = require('../../lib/Changelogs');

describe('Changelogs', () => {
    it('gets change log URLs', async () => {
        const urls = await Changelogs.getChangelogUrls();
        expect(urls).toBeDefined();
        expect(urls.length).toBeGreaterThan(16);
    });

    it('parses changelogs', async () => {
        const nodeReleases = await Changelogs.parse();
        expect(nodeReleases).toBeDefined();
        const releaseVersions = Object.keys(nodeReleases);
        expect(releaseVersions.length).toBeGreaterThan(503);
        expect(nodeReleases['0.10.0']).toBeDefined();
        expect(releaseVersions[0]).toEqual('0.10.0');
        expect(releaseVersions[404]).toEqual('13.9.0');
    });
});
