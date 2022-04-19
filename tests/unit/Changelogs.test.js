const { Changelogs } = require('../../lib/Changelogs');
const { NodeVersionAudit } = require('../../lib/NodeVersionAudit');
const { NodeVersion } = require('../../lib/NodeVersion');
const { CveId } = require('../../lib/CveId');

describe('Changelogs', () => {
    it('parses a single release', async () => {
        const rawChangelog = `
            <a id="10.24.1"></a>

            ## 2021-04-06, Version 10.24.1 'Dubnium' (LTS), @mylesborins

            This is a security release.

            ### Notable Changes

            Vulerabilties fixed:

            * **CVE-2021-3450**: OpenSSL - CA certificate check bypass with X509\\_V\\_FLAG\\_X509\\_STRICT (High)
              * This is a vulnerability in OpenSSL which may be exploited through Node.js. You can read more about it in <https://www.openssl.org/news/secadv/20210325.txt>
              * Impacts:
                * All versions of the 15.x, 14.x, 12.x and 10.x releases lines
            * **CVE-2021-3449**: OpenSSL - NULL pointer deref in signature\\_algorithms processing (High)
              * This is a vulnerability in OpenSSL which may be exploited through Node.js. You can read more about it in <https://www.openssl.org/news/secadv/20210325.txt>
              * Impacts:
                * All versions of the 15.x, 14.x, 12.x and 10.x releases lines
            * **CVE-2020-7774**: npm upgrade - Update y18n to fix Prototype-Pollution (High)
              * This is a vulnerability in the y18n npm module which may be exploited by prototype pollution. You can read more about it in <https://github.com/advisories/GHSA-c4w7-xm78-47vh>
              * Impacts:
                * All versions of the 14.x, 12.x and 10.x releases lines

            <a id="10.24.0"></a>

            ## 2021-02-23, Version 10.24.0 'Dubnium' (LTS), @richardlau

            This is a security release.
        `;
        const parsedChangelog = Changelogs.parseChangelog(rawChangelog);
        expect(parsedChangelog).toBeDefined();
        expect(parsedChangelog['10.24.1']).toBeDefined();
        expect(parsedChangelog['10.24.1'].version).toEqual(NodeVersion.fromString('10.24.1'));
        expect(parsedChangelog['10.24.1'].version).toEqual(NodeVersion.fromString('10.24.1'));
        expect(parsedChangelog['10.24.1'].releaseDate).toEqual(new Date('2021-04-06'));
        expect(parsedChangelog['10.24.1'].patchedCveIds.length).toEqual(3);
        expect(parsedChangelog['10.24.1'].patchedCveIds[0]).toEqual(CveId.fromString('CVE-2020-7774'));
        expect(parsedChangelog['10.24.0']).toBeDefined();
        expect(Object.keys(parsedChangelog)[0]).toEqual('10.24.0');
    });
});
