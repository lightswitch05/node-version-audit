const { Logger } = require('../../lib/Logger');
const { Args } = require('../../lib/Args');
const { InvalidArgumentException } = require('../../lib/Exceptions');

describe('Args.getVerbosity', () => {
    it('defaults to error', () => {
        const args = new Args();
        expect(args.getVerbosity()).toEqual(Logger.ERROR);
    });

    it('defaults to error', () => {
        const args = new Args();
        expect(args.getVerbosity()).toEqual(Logger.ERROR);
    });

    it('sets DEBUG', () => {
        const args = new Args();
        args[Args.OPTIONS.V_DEBUG] = true;
        expect(args.getVerbosity()).toEqual(Logger.DEBUG);
    });

    it('sets INFO', () => {
        const args = new Args();
        args[Args.OPTIONS.V_INFO] = true;
        expect(args.getVerbosity()).toEqual(Logger.INFO);
    });

    it('sets WARNING', () => {
        const args = new Args();
        args[Args.OPTIONS.V_WARNING] = true;
        expect(args.getVerbosity()).toEqual(Logger.WARNING);
    });

    it('sets SILENT', () => {
        const args = new Args();
        args[Args.OPTIONS.SILENT] = true;
        expect(args.getVerbosity()).toEqual(Logger.SILENT);
    });

    it('conflicts choose the more precise level', () => {
        const args = new Args();
        args[Args.OPTIONS.V_INFO] = true;
        args[Args.OPTIONS.V_WARNING] = true;
        args[Args.OPTIONS.SILENT] = true;
        expect(args.getVerbosity()).toEqual(Logger.INFO);
    });
});

describe('Args.parseArgs', () => {
    it('parses no args', () => {
        const args = Args.parseArgs([null, null]);
        expect(args).toBeDefined();
        expect(args[Args.OPTIONS.NODE_VERSION]).toEqual(process.versions.node);
    });

    it('parses version', () => {
        const args = Args.parseArgs([null, null, '--version=99.99.99']);
        expect(args).toBeDefined();
        expect(args[Args.OPTIONS.NODE_VERSION]).toEqual('99.99.99');
    });

    it('throws on unknown args', () => {
        expect(() => {
            Args.parseArgs([null, null, 'no-dashes']);
        }).toThrowError(InvalidArgumentException);

        expect(() => {
            Args.parseArgs([null, null, '--unknown-arg']);
        }).toThrowError(InvalidArgumentException);
    });

    it('throws on version without version', () => {
        expect(() => {
            Args.parseArgs([null, null, '--version']);
        }).toThrowError(InvalidArgumentException);

        expect(() => {
            Args.parseArgs([null, null, '--version=']);
        }).toThrowError(InvalidArgumentException);

        expect(() => {
            Args.parseArgs([null, null, '--version=1']);
        }).toThrowError(InvalidArgumentException);

        expect(() => {
            Args.parseArgs([null, null, '--version=1.2']);
        }).toThrowError(InvalidArgumentException);

        expect(() => {
            Args.parseArgs([null, null, '--version=1.2.']);
        }).toThrowError(InvalidArgumentException);

        expect(() => {
            Args.parseArgs([null, null, '--version', '1.2.3']);
        }).toThrowError(InvalidArgumentException);
    });

    it('throws on missing version if NVA_REQUIRE_VERSION_ARG', () => {
        process.env.NVA_REQUIRE_VERSION_ARG = 'true';
        expect(() => {
            Args.parseArgs([null, null]);
        }).toThrowError(InvalidArgumentException);
    });
});
