jest.mock('../../lib/CachedDownload');
const CachedDownload = require('../../lib/CachedDownload');
const { SupportSchedule } = require('../../lib/SupportSchedule');

describe('SupportSchedule.parse', () => {
    beforeAll(() => {
        CachedDownload.CachedDownload.json.mockResolvedValue({
            'v0.12': {
                start: '2015-02-06',
                end: '2016-12-31',
            },
            v19: {
                start: '2022-10-18',
                maintenance: '2023-04-01',
                end: '2023-06-01',
            },
            v20: {
                start: '2023-04-18',
                lts: '2023-10-24',
                maintenance: '2024-10-22',
                end: '2026-04-30',
                codename: '',
            },
        });
    });

    it('parses the mocked support schedule', async () => {
        const supportSchedule = await SupportSchedule.parse();
        expect(supportSchedule).not.toBeNull();
        expect(Object.keys(supportSchedule)).toEqual(['19', '20']);
        expect(supportSchedule['19']).not.toHaveProperty('lts');
        expect(supportSchedule['19'].start).toEqual(new Date('2022-10-18'));
        expect(supportSchedule['19'].maintenance).toEqual(new Date('2023-04-01'));
        expect(supportSchedule['19'].end).toEqual(new Date('2023-06-01'));

        expect(supportSchedule['20']).toEqual({
            start: new Date('2023-04-18'),
            lts: new Date('2023-10-24'),
            maintenance: new Date('2024-10-22'),
            end: new Date('2026-04-30'),
        });
    });
});
