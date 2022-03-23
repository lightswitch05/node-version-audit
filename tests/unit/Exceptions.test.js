const {
    ParseException,
    StaleRulesException,
    InvalidArgumentException,
    InvalidVersionException,
    UnknownVersionException,
} = require('../../lib/Exceptions');

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
