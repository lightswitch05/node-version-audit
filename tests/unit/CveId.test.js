const { CveId } = require('../../lib/CveId');
const { ParseException } = require('../../lib/Exceptions');

describe('CveId.fromString', () => {
    it('parses a simple CVE', () => {
        const cve = CveId.fromString('CVE-2021-43803');
        expect(cve).not.toBeNull();
        expect(cve.year).toBe(2021);
        expect(cve.sequenceNumber).toBe(43803);
        expect(cve.id).toBe('CVE-2021-43803');
    });

    it('is not case sensitive', () => {
        const cve = CveId.fromString('cve-2021-22939');
        expect(cve).not.toBeNull();
        expect(cve.year).toBe(2021);
        expect(cve.sequenceNumber).toBe(22939);
        expect(cve.id).toBe('CVE-2021-22939');
    });

    it('does not parse null', () => {
        expect(() => {
            CveId.fromString(null);
        }).toThrow(ParseException);
    });

    it('does not parse empty string', () => {
        expect(() => {
            CveId.fromString('');
        }).toThrow(ParseException);
    });

    it('does not parse missing year', () => {
        expect(() => {
            CveId.fromString('CVE--22939');
        }).toThrow(ParseException);

        expect(() => {
            CveId.fromString('CVE-22939');
        }).toThrow(ParseException);
    });

    it('does not parse missing sequence', () => {
        expect(() => {
            CveId.fromString('CVE-2021-');
        }).toThrow(ParseException);

        expect(() => {
            CveId.fromString('CVE-2021');
        }).toThrow(ParseException);
    });

    it('does not parse missing CVE', () => {
        expect(() => {
            CveId.fromString('-2021-22939');
        }).toThrow(ParseException);

        expect(() => {
            CveId.fromString('2021-22939');
        }).toThrow(ParseException);
    });
});

describe('CveId.compare', () => {
    it('compares equal versions', () => {
        const a = CveId.fromString('CVE-2021-43803');
        const b = CveId.fromString('CVE-2021-43803');
        expect(CveId.compare(a, b)).toBe(0);
        expect(CveId.compare(b, a)).toBe(0);
    });

    it('compares null', () => {
        const a = CveId.fromString('CVE-2021-43803');
        expect(CveId.compare(a, null)).toBe(1);
        expect(CveId.compare(null, a)).toBe(-1);
    });

    it('compares different sequence number', () => {
        const a = CveId.fromString('CVE-2021-43803');
        const b = CveId.fromString('CVE-2021-43804');
        expect(CveId.compare(a, b)).toBe(-1);
        expect(CveId.compare(b, a)).toBe(1);
    });

    it('compares different year', () => {
        const a = CveId.fromString('CVE-2021-43803');
        const b = CveId.fromString('CVE-2022-43803');
        expect(CveId.compare(a, b)).toBe(-1);
        expect(CveId.compare(b, a)).toBe(1);
    });

    it('sorts', () => {
        const a = CveId.fromString('CVE-2017-30000');
        const b = CveId.fromString('CVE-2018-10000');
        const c = CveId.fromString('CVE-2018-10000');
        const d = CveId.fromString('CVE-2018-20000');
        const e = CveId.fromString('CVE-2019-10000');
        const f = CveId.fromString('CVE-2020-40000');
        const list = [f, e, d, null, b, c, null, a].sort(CveId.compare);
        expect(list).toEqual([null, null, a, b, c, d, e, f]);
    });
});

describe('CveId.toJSON', () => {
    it('serializes to a string', () => {
        const cve = CveId.fromString('CVE-2021-43803');
        expect(JSON.stringify(cve)).toEqual('"CVE-2021-43803"');
    });
});

describe('CveId.toString', () => {
    it('serializes to a string', () => {
        const cve = CveId.fromString('CVE-2021-43803');
        expect(`${cve}`).toEqual('CVE-2021-43803');
    });
});
