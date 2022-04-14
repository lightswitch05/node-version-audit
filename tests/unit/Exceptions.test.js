const {
    ParseException,
    StaleRulesException,
    InvalidArgumentException,
    InvalidVersionException,
    UnknownVersionException,
    DownloadException,
    InvalidRuntimeException,
} = require('../../lib/Exceptions');
const { NodeVersion } = require('../../lib/NodeVersion');

describe('ParseException', () => {
    describe('fromString', () => {
        it('Creates an exception from a string', () => {
            const message = 'Test exception';
            const exception = ParseException.fromString(message);
            expect(exception.message).toEqual(message);
        });
    });

    describe('fromException', () => {
        it('creates an exception from a exception', () => {
            const message = 'Test exception';
            const exception = ParseException.fromException(new Error(message));
            expect(exception.message).toEqual(message);
        });
    });
});

describe('StaleRulesException.fromString', () => {
    it('Creates an exception from a string', () => {
        const message = 'Test exception';
        const exception = StaleRulesException.fromString(message);
        expect(exception.message).toEqual(message);
    });
});

describe('InvalidArgumentException.fromString', () => {
    it('Creates an exception from a string', () => {
        const message = 'Test exception';
        const exception = InvalidArgumentException.fromString(message);
        expect(exception.message).toEqual(message);
    });
});

describe('InvalidVersionException.fromString', () => {
    it('Creates an exception from a string', () => {
        const version = 'a.b.c';
        const exception = InvalidVersionException.fromString(version);
        expect(exception.message).toMatch(/a\.b\.c/);
    });
});

describe('UnknownVersionException.fromString', () => {
    it('Creates an exception from a string', () => {
        const version = 'a.b.c';
        const exception = UnknownVersionException.fromString(version);
        expect(exception.message).toMatch(/a\.b\.c/);
    });
});

describe('DownloadException', () => {
    it('creates an exception from a string', () => {
        const message = 'unable to download file';
        const exception = DownloadException.fromString('unable to download file');
        expect(exception.message).toMatch(message);
    });

    it('creates an exception from a exception', () => {
        const message = 'Test exception';
        const exception = DownloadException.fromException(new Error(message));
        expect(exception.message).toEqual(message);
    });
});

describe('InvalidRuntimeException', () => {
    it('creates an exception from a version', () => {
        const exception = InvalidRuntimeException.fromVersion(new NodeVersion(12, 0, 0));
        expect(exception.message).toMatch(/12\.0\.0/);
    });
});
