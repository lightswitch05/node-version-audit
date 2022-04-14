const { CveFeed } = require('../../lib/CveFeed');
const { CveId } = require('../../lib/CveId');

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
