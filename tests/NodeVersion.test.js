const { NodeVersion } = require('../lib/NodeVersion');

describe('NodeVersion.fromString', () => {
    it('parses a simple version', () => {
        const version = NodeVersion.fromString('1.2.3');
        expect(version).not.toBeNull();
        expect(version.major).toBe(1);
        expect(version.minor).toBe(2);
        expect(version.patch).toBe(3);
    });

    it('does not parse empty string', () => {
        const version = NodeVersion.fromString('');
        expect(version).toBeNull();
    });

    it('does not parse single number', () => {
        const version = NodeVersion.fromString('1');
        expect(version).toBeNull();
    });

    it('does not parse double number', () => {
        const version = NodeVersion.fromString('1.2');
        expect(version).toBeNull();
    });

    it('does not parse 4 numbers', () => {
        const version = NodeVersion.fromString('1.2.3.4');
        expect(version).toBeNull();
    });

    it('does not parse alpha chars in major', () => {
        const version = NodeVersion.fromString('a.2.3');
        expect(version).toBeNull();
    });

    it('does not parse alpha chars in minor', () => {
        const version = NodeVersion.fromString('1.2b.3');
        expect(version).toBeNull();
    });

    it('does not parse alpha chars in patch', () => {
        const version = NodeVersion.fromString('1.2.3c');
        expect(version).toBeNull();
    });

    it('does not parse multiline', () => {
        const version = NodeVersion.fromString('1.2.3\n\nasdfasdf\n');
        expect(version).toBeNull();
    });

    it('does not parse null', () => {
        const version = NodeVersion.fromString(null);
        expect(version).toBeNull();
    });

    it('does not parse negative versions', () => {
        const version = NodeVersion.fromString('1.-2.3');
        expect(version).toBeNull();
    });

    it('parses large versions', () => {
        const version = NodeVersion.fromString('1000.200000.3000000000');
        expect(version).not.toBeNull();
        expect(version.major).toBe(1000);
        expect(version.minor).toBe(200000);
        expect(version.patch).toBe(3000000000);
    });
});

describe('NodeVersion.compare', () => {
    it('compares equal versions', () => {
        const a = new NodeVersion(1, 2, 3);
        const b = new NodeVersion(1, 2, 3);
        expect(NodeVersion.compare(a, b)).toBe(0);
        expect(NodeVersion.compare(b, a)).toBe(0);
    });

    it('compares null', () => {
        const a = new NodeVersion(1, 2, 3);
        expect(NodeVersion.compare(a, null)).toBe(1);
        expect(NodeVersion.compare(null, a)).toBe(-1);
    });

    it('compares different patch version', () => {
        const a = new NodeVersion(1, 2, 3);
        const b = new NodeVersion(1, 2, 4);
        expect(NodeVersion.compare(a, b)).toBe(-1);
        expect(NodeVersion.compare(b, a)).toBe(1);
    });

    it('compares different minor version', () => {
        const a = new NodeVersion(1, 2, 3);
        const b = new NodeVersion(1, 1, 3);
        expect(NodeVersion.compare(a, b)).toBe(1);
        expect(NodeVersion.compare(b, a)).toBe(-1);
    });

    it('compares different major version', () => {
        const a = new NodeVersion(2, 2, 3);
        const b = new NodeVersion(1, 2, 3);
        expect(NodeVersion.compare(a, b)).toBe(1);
        expect(NodeVersion.compare(b, a)).toBe(-1);
    });

    it('sorts', () => {
        const a = new NodeVersion(1, 1, 1);
        const b = new NodeVersion(1, 1, 2);
        const c = new NodeVersion(1, 2, 0);
        const d = new NodeVersion(2, 0, 0);
        const e = new NodeVersion(2, 0, 0);
        const f = new NodeVersion(2, 0, 10);
        const g = new NodeVersion(2, 1, 0);
        const list = [g, f, e, d, null, b, c, null, a].sort(NodeVersion.compare);
        expect(list).toEqual([null, null, a, b, c, d, e, f, g]);
    });
});
