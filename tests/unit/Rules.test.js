const { StaleRulesException } = require('../../lib/Exceptions');
const { Rules } = require('../../lib/Rules');

describe('Rules.assertFreshRules', () => {
    it('throws on stale rules', () => {
        const expiredDate = new Date(new Date().getTime() / 1000 - 1209601);
        expect(() => {
            Rules.assertFreshRules({
                lastUpdatedDate: expiredDate,
            });
        }).toThrowError(StaleRulesException);
    });

    it('does not throws on fresh rules', () => {
        const expiredDate = new Date(new Date().getTime() / 1000 - 1209590);
        expect(() => {
            Rules.assertFreshRules({
                lastUpdatedDate: expiredDate,
            });
        }).toThrowError(StaleRulesException);
    });
});
