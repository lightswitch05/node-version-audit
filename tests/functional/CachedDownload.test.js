const { CachedDownload } = require('../../lib/CachedDownload');
const { DownloadException } = require('../../lib/Exceptions');

describe('CachedDownload', () => {
    it('downloads gzip json', async () => {
        const url = 'https://httpbin.org/gzip?q=' + Date.now() + Math.random() + '&format=gz';
        const response = await CachedDownload.json(url);
        expect(response).toBeDefined();
        expect(response.gzipped).toBe(true);
        expect(response.method).toMatch('GET');
    });

    it('handles 500 error code', async () => {
        const download = CachedDownload.download('https://httpbin.org/status/500');
        await expect(download).rejects.toThrowError(DownloadException);
    });

    it('handles invalid JSON download', async () => {
        const download = CachedDownload.json('https://httpbin.org/status/200');
        await expect(download).rejects.toThrowError(DownloadException);
    });
});
