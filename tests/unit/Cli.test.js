const { Cli } = require('../../lib/Cli');

describe('Cli', () => {
    it('prints helps with the help arg', async () => {
        const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {});
        const showHelpSpy = jest.spyOn(Cli, 'showHelp');
        const args = [null, null, '--help'];
        const cli = new Cli(args);
        await cli.run();
        expect(showHelpSpy).toHaveBeenCalled();
        expect(exitMock).toBeCalledWith(0);
    });

    it('prints helps with invalid version arg', async () => {
        const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {});
        const showHelpSpy = jest.spyOn(Cli, 'showHelp');
        const args = [null, null, '--version=invalid'];
        const cli = new Cli(args);
        await cli.run();
        expect(showHelpSpy).toHaveBeenCalled();
        expect(exitMock).toBeCalledWith(120);
    });

    it('prints helps with unknown arg', async () => {
        const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {});
        const showHelpSpy = jest.spyOn(Cli, 'showHelp');
        const args = [null, null, '--not-an-option'];
        expect(() => {
            new Cli(args);
        }).toThrowError("Invalid argument: 'not-an-option'");
        expect(showHelpSpy).toHaveBeenCalled();
        expect(exitMock).toBeCalledWith(120);
    });
});
