const { CveFeed } = require('../../lib/CveFeed');
const { CveId } = require('../../lib/CveId');
jest.mock('../../lib/CachedDownload');
const CachedDownload = require('../../lib/CachedDownload');

const FEED = {
    CVE_data_type: 'CVE',
    CVE_data_format: 'MITRE',
    CVE_data_version: '4.0',
    CVE_data_numberOfCVEs: '780',
    CVE_data_timestamp: '2022-04-23T00:00Z',
    CVE_Items: [
        {
            cve: {
                data_type: 'CVE',
                data_format: 'MITRE',
                data_version: '4.0',
                CVE_data_meta: {
                    ID: 'CVE-2022-1108',
                    ASSIGNER: 'psirt@lenovo.com',
                },
                problemtype: {
                    problemtype_data: [
                        {
                            description: [],
                        },
                    ],
                },
                references: {
                    reference_data: [
                        {
                            url: 'https://support.lenovo.com/us/en/product_security/LEN-84943',
                            name: 'https://support.lenovo.com/us/en/product_security/LEN-84943',
                            refsource: 'MISC',
                            tags: [],
                        },
                    ],
                },
                description: {
                    description_data: [
                        {
                            lang: 'en',
                            value: 'A potential vulnerability due to improper buffer validation in the SMI handler LenovoFlashDeviceInterface in Thinkpad X1 Fold Gen 1 could be exploited by an attacker with local access and elevated privileges to execute arbitrary code.',
                        },
                    ],
                },
            },
            configurations: {
                CVE_data_version: '4.0',
                nodes: [],
            },
            impact: {},
            publishedDate: '2022-04-22T21:15Z',
            lastModifiedDate: '2022-04-22T21:15Z',
        },
        {
            cve: {
                data_type: 'CVE',
                data_format: 'MITRE',
                data_version: '4.0',
                CVE_data_meta: {
                    ID: 'CVE-2022-27456',
                    ASSIGNER: 'cve@mitre.org',
                },
                problemtype: {
                    problemtype_data: [
                        {
                            description: [
                                {
                                    lang: 'en',
                                    value: 'CWE-416',
                                },
                            ],
                        },
                    ],
                },
                references: {
                    reference_data: [
                        {
                            url: 'https://jira.mariadb.org/browse/MDEV-28093',
                            name: 'https://jira.mariadb.org/browse/MDEV-28093',
                            refsource: 'MISC',
                            tags: ['Exploit', 'Issue Tracking', 'Third Party Advisory'],
                        },
                    ],
                },
                description: {
                    description_data: [
                        {
                            lang: 'en',
                            value: 'MariaDB Server v10.6.3 and below was discovered to contain an use-after-free in the component VDec::VDec at /sql/sql_type.cc.',
                        },
                    ],
                },
            },
            configurations: {
                CVE_data_version: '4.0',
                nodes: [
                    {
                        operator: 'OR',
                        children: [],
                        cpe_match: [
                            {
                                vulnerable: true,
                                cpe23Uri: 'cpe:2.3:a:mariadb:mariadb:*:*:*:*:*:*:*:*',
                                versionEndIncluding: '10.6.3',
                                cpe_name: [],
                            },
                        ],
                    },
                ],
            },
            impact: {
                baseMetricV3: {
                    cvssV3: {
                        version: '3.1',
                        vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
                        attackVector: 'NETWORK',
                        attackComplexity: 'LOW',
                        privilegesRequired: 'NONE',
                        userInteraction: 'NONE',
                        scope: 'UNCHANGED',
                        confidentialityImpact: 'NONE',
                        integrityImpact: 'NONE',
                        availabilityImpact: 'HIGH',
                        baseScore: 7.5,
                        baseSeverity: 'HIGH',
                    },
                    exploitabilityScore: 3.9,
                    impactScore: 3.6,
                },
                baseMetricV2: {
                    cvssV2: {
                        version: '2.0',
                        vectorString: 'AV:N/AC:L/Au:N/C:N/I:N/A:P',
                        accessVector: 'NETWORK',
                        accessComplexity: 'LOW',
                        authentication: 'NONE',
                        confidentialityImpact: 'NONE',
                        integrityImpact: 'NONE',
                        availabilityImpact: 'PARTIAL',
                        baseScore: 5.0,
                    },
                    severity: 'MEDIUM',
                    exploitabilityScore: 10.0,
                    impactScore: 2.9,
                    acInsufInfo: false,
                    obtainAllPrivilege: false,
                    obtainUserPrivilege: false,
                    obtainOtherPrivilege: false,
                    userInteractionRequired: false,
                },
            },
            publishedDate: '2022-04-14T13:15Z',
            lastModifiedDate: '2022-04-21T15:00Z',
        },
        {
            cve: {
                data_type: 'CVE',
                data_format: 'MITRE',
                data_version: '4.0',
                CVE_data_meta: {
                    ID: 'CVE-2022-1350',
                    ASSIGNER: 'cna@vuldb.com',
                },
                problemtype: {
                    problemtype_data: [
                        {
                            description: [],
                        },
                    ],
                },
                references: {
                    reference_data: [
                        {
                            url: 'https://bugs.ghostscript.com/show_bug.cgi?id=705156',
                            name: 'https://bugs.ghostscript.com/show_bug.cgi?id=705156',
                            refsource: 'MISC',
                            tags: [],
                        },
                        {
                            url: 'https://vuldb.com/?id.197290',
                            name: 'https://vuldb.com/?id.197290',
                            refsource: 'MISC',
                            tags: [],
                        },
                        {
                            url: 'https://bugs.ghostscript.com/attachment.cgi?id=22323',
                            name: 'https://bugs.ghostscript.com/attachment.cgi?id=22323',
                            refsource: 'MISC',
                            tags: [],
                        },
                    ],
                },
                description: {
                    description_data: [
                        {
                            lang: 'en',
                            value: 'A vulnerability classified as problematic was found in GhostPCL 9.55.0. This vulnerability affects the function chunk_free_object of the file gsmchunk.c. The manipulation with a malicious file leads to a memory corruption. The attack can be initiated remotely but requires user interaction. The exploit has been disclosed to the public as a POC and may be used. It is recommended to apply the patches to fix this issue.',
                        },
                    ],
                },
            },
            configurations: {
                CVE_data_version: '4.0',
                nodes: [],
            },
            impact: {},
            publishedDate: '2022-04-14T07:15Z',
            lastModifiedDate: '2022-04-15T15:15Z',
        },
        {
            cve: {
                data_type: 'CVE',
                data_format: 'MITRE',
                data_version: '4.0',
                CVE_data_meta: {
                    ID: 'CVE-2022-1350',
                    ASSIGNER: 'cna@vuldb.com',
                },
                problemtype: {
                    problemtype_data: [
                        {
                            description: [],
                        },
                    ],
                },
                references: {
                    reference_data: [
                        {
                            url: 'https://bugs.ghostscript.com/show_bug.cgi?id=705156',
                            name: 'https://bugs.ghostscript.com/show_bug.cgi?id=705156',
                            refsource: 'MISC',
                            tags: [],
                        },
                        {
                            url: 'https://vuldb.com/?id.197290',
                            name: 'https://vuldb.com/?id.197290',
                            refsource: 'MISC',
                            tags: [],
                        },
                        {
                            url: 'https://bugs.ghostscript.com/attachment.cgi?id=22323',
                            name: 'https://bugs.ghostscript.com/attachment.cgi?id=22323',
                            refsource: 'MISC',
                            tags: [],
                        },
                    ],
                },
                description: {
                    description_data: [
                        {
                            lang: 'en',
                            value: 'A vulnerability classified as problematic was found in GhostPCL 9.55.0. This vulnerability affects the function chunk_free_object of the file gsmchunk.c. The manipulation with a malicious file leads to a memory corruption. The attack can be initiated remotely but requires user interaction. The exploit has been disclosed to the public as a POC and may be used. It is recommended to apply the patches to fix this issue.',
                        },
                    ],
                },
            },
            configurations: {
                CVE_data_version: '4.0',
                nodes: [],
            },
            impact: {},
            publishedDate: '2022-04-14T07:15Z',
            lastModifiedDate: '2022-04-15T15:15Z',
        },
    ],
};

describe('CveFeed', () => {
    beforeAll(() => {
        CachedDownload.CachedDownload.json.mockResolvedValue(FEED);
    });

    describe('CveFeed._parseCveItem', () => {
        let rawCveItem = null;
        beforeEach(() => {
            rawCveItem = {
                publishedDate: '2014-07-02T10:35Z',
                lastModifiedDate: '2017-08-29T01:34Z',
                cve: {
                    CVE_data_meta: {
                        ID: 'CVE-2014-3066',
                    },
                    description: {
                        description_data: [
                            {
                                lang: 'fr',
                                value: 'FR description',
                            },
                            {
                                lang: 'en',
                                value: 'EN description',
                            },
                        ],
                    },
                },
                impact: {
                    baseMetricV2: {
                        cvssV2: {
                            baseScore: 5.0,
                        },
                    },
                    baseMetricV3: {
                        cvssV3: {
                            baseScore: 9.8,
                        },
                    },
                },
            };
        });

        it('parses V2 score', () => {
            delete rawCveItem.impact.baseMetricV3;
            const cveItem = CveFeed._parseCveItem(rawCveItem);
            expect(cveItem).toBeDefined();
            expect(cveItem.id).toEqual(CveId.fromString('CVE-2014-3066'));
            expect(cveItem.baseScore).toEqual(5);
            expect(cveItem.description).toEqual('EN description');
            expect(cveItem.publishedDate).toEqual(new Date('2014-07-02T10:35Z').toISOString());
            expect(cveItem.lastModifiedDate).toEqual(new Date('2017-08-29T01:34Z').toISOString());
        });

        it('parses a V3 score', () => {
            const cveItem = CveFeed._parseCveItem(rawCveItem);
            expect(cveItem).toBeDefined();
            expect(cveItem.id).toEqual(CveId.fromString('CVE-2014-3066'));
            expect(cveItem.baseScore).toEqual(9.8);
            expect(cveItem.description).toEqual('EN description');
            expect(cveItem.publishedDate).toEqual(new Date('2014-07-02T10:35Z').toISOString());
            expect(cveItem.lastModifiedDate).toEqual(new Date('2017-08-29T01:34Z').toISOString());
        });

        it('does not parse a null CVE', () => {
            rawCveItem.cve.CVE_data_meta.ID = null;
            const cveItem = CveFeed._parseCveItem(rawCveItem);
            expect(cveItem).toBeNull();
        });

        it('parses a CVE without a description', () => {
            delete rawCveItem.cve.description.description_data;
            const cveItem = CveFeed._parseCveItem(rawCveItem);
            expect(cveItem).toBeDefined();
            expect(cveItem.description).toBeNull();
        });

        it('parses a CVE without a score', () => {
            delete rawCveItem.impact.baseMetricV3;
            delete rawCveItem.impact.baseMetricV2;
            const cveItem = CveFeed._parseCveItem(rawCveItem);
            expect(cveItem).toBeDefined();
            expect(cveItem.baseScore).toBeNull();
        });
    });

    describe('CveFeed._parseFeed', () => {
        it('parses a feed', () => {
            CveFeed._parseFeed(
                [
                    CveId.fromString('CVE-2022-1350'),
                    CveId.fromString('CVE-2022-27456'),
                    CveId.fromString('CVE-2022-1108'),
                ],
                FEED
            );
        });
    });

    describe('CveFeed._downloadFeed', () => {
        it('downloads a feed', async () => {
            const feed = await CveFeed._downloadFeed('recent');
            expect(feed).toBeDefined();
        });
    });

    describe('CveFeed.parse', () => {
        it('parses a feed', async () => {
            const cveDetails = await CveFeed.parse([CveId.fromString('CVE-2022-1108')]);
            expect(cveDetails).toBeDefined();
            expect(typeof cveDetails).toBe('object');
            expect(cveDetails['CVE-2022-1108']).toBeDefined();
            expect(Object.keys(cveDetails).length).toBe(1);
        });
    });
});
