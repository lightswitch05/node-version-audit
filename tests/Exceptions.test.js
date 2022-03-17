const { ParseException } = require('../lib/Exceptions');

describe('ParseException.fromString', () => {
    it('Creates an exception from a string', () => {
        const message = 'Test exception';
        const exception = ParseException.fromString(message);
        expect(exception.message).toEqual(message);
    });
});
