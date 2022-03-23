const { CveDetails } = require('../../lib/CveDetails');
const { CveId } = require('../../lib/CveId');

describe('CveDetails', () => {
    it('creates a simple object', () => {
        const id = CveId.fromString('CVE-2021-00123');
        const baseScore = 9;
        const publishedDate = new Date('2022-03-16T20:15Z').toISOString();
        const lastModifiedDate = new Date('2022-03-16T18:15Z').toISOString();
        const description = 'This is a CVE description';
        const details = new CveDetails(id, baseScore, publishedDate, lastModifiedDate, description);
        expect(details).not.toBeNull();
        expect(details.id).toBe(id);
        expect(details.baseScore).toBe(baseScore);
        expect(details.publishedDate).toBe(publishedDate);
        expect(details.lastModifiedDate).toBe(lastModifiedDate);
        expect(details.description).toBe(description);
    });
});
