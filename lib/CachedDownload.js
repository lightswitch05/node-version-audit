const path = require('path');
const fs = require('fs');
const util = require('util');
const https = require('https');
const crypto = require('crypto');
const zlib = require('zlib');
const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const gunzip = util.promisify(zlib.gunzip);

const INDEX_FILE_NAME = 'index.json';

const CachedDownload = {};

/**
 * @param url
 * @return {Promise<any>}
 */
CachedDownload.json = async function (url) {
    const response = await CachedDownload.download(url);
    return JSON.parse(response);
};

/**
 * @param url
 * @return {Promise<any>}
 */
CachedDownload.download = async function (url) {
    await setup();
    return downloadCachedFile(url);
};

/**
 * @param {string} url
 * @return {Promise<string>}
 */
async function downloadCachedFile(url) {
    if (await isCached(url)) {
        return getFileFromCache(url);
    }
    const data = downloadFile(url);
    await writeCacheFile(url, await data);
    return data;
}

/**
 * @param {string} url
 * @return {Promise<string>}
 */
function downloadFile(url) {
    console.debug('Downloading: ', url);
    return new Promise((resolve, reject) => {
        const headers = {
            'user-agent': 'node-version-audit/1',
            accept: '*/*',
        };
        const req = https.request(url, { timeout: 10000, headers: headers }, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Error downloading file from ${url}: ${res.statusCode}`));
            }
            const body = [];
            res.on('data', (chunk) => {
                body.push(chunk);
            });
            res.on('end', () => {
                try {
                    const buffer = Buffer.concat(body);
                    if (url.endsWith('gz')) {
                        gunzip(buffer).then((unzipped) => {
                            resolve(unzipped.toString());
                        });
                    } else {
                        resolve(buffer.toString());
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

/**
 *
 * @param {string} url
 * @param {string} data
 * @return {Promise<void>}
 */
async function writeCacheFile(url, data) {
    console.debug('Writing file cache: ', url);
    const cacheIndex = await getCacheIndex();
    const filename = urlToFileName(url);
    cacheIndex[url] = {
        filename: filename,
        lastModifiedDate: new Date().toISOString(),
    };
    await writeFile(getCachePath(filename), data);
    return saveCacheIndex(cacheIndex);
}

/**
 * @param {string} url
 * @return {Promise<string>}
 */
async function getFileFromCache(url) {
    console.debug('Loading file from cache: ', url);
    const filename = urlToFileName(url);
    const fullPath = getCachePath(filename);
    if (!fs.existsSync(fullPath)) {
        throw new Error('Cached file not found: ' + fullPath);
    }
    const buf = await readFile(fullPath);
    return buf.toString('utf8');
}

/**
 * @param {string} url
 * @return string
 */
function urlToFileName(url) {
    const hash = crypto.createHash('sha256').update(url).digest('base64');
    return hash.replace(/[+/]/g, '').substring(0, 15) + '.txt';
}

/**
 * @param {string} url
 * @return {Promise<boolean>}
 */
async function isCached(url) {
    const cacheIndex = await getCacheIndex();
    if (!cacheIndex[url]) {
        console.debug('Cache does not exist for ', url);
        return false;
    }
    const lastModifiedDate = new Date(cacheIndex[url].lastModifiedDate);
    const expired = await isExpired(url, lastModifiedDate);
    if (expired) {
        console.debug('Cache has expired for ', url);
    } else {
        console.debug('Cache is valid for ', url);
    }
    return !expired;
}

/**
 * @param {string} url
 * @param {Date} lastModifiedDate
 * @return {Promise<boolean>}
 */
async function isExpired(url, lastModifiedDate) {
    const elapsedSeconds = (new Date().getTime() - lastModifiedDate.getTime()) / 1000;
    // enforce a minimum cache of 1 hour to makeup for lack of last modified time on changelog
    if (elapsedSeconds < 3600) {
        console.debug('Cache time under 3600: ', url);
        return false;
    }
    const serverLastModifiedDate = await getServerLastModifiedDate(url);
    return serverLastModifiedDate.getTime() > lastModifiedDate.getTime();
}

/**
 * @param {string} url
 * @return {Promise<Date>}
 */
function getServerLastModifiedDate(url) {
    return new Promise((resolve, reject) => {
        const headers = {
            'user-agent': 'node-version-audit/1',
            accept: '*/*',
        };
        const req = https.request(url, { method: 'HEAD', timeout: 10000, headers: headers }, (res) => {
            if (res.headers['last-modified']) {
                return resolve(new Date(res.headers['last-modified']));
            }
            resolve(new Date());
        });
        req.on('error', reject);
        req.end();
    });
}

/**
 * @return {Promise<void>}
 */
async function setup() {
    const tempDir = getCachePath();
    if (!fs.existsSync(tempDir)) {
        await mkdir(tempDir);
    }
    const indexPath = getCachePath(INDEX_FILE_NAME);
    if (!fs.existsSync(indexPath)) {
        console.debug('Cache index not found, creating new one.');
        await saveCacheIndex({});
    }
}

/**
 * @param {object} index
 */
async function saveCacheIndex(index) {
    const fullPath = getCachePath(INDEX_FILE_NAME);
    const data = JSON.stringify(index, null, 4);
    await writeFile(fullPath, data);
}

/**
 * @return {Promise<object>}
 */
async function getCacheIndex() {
    const fullPath = getCachePath(INDEX_FILE_NAME);
    const buf = await readFile(fullPath);
    return JSON.parse(buf.toString('utf8'));
}

/**
 * @param {string?} filename
 * @return {string}
 */
function getCachePath(filename = '') {
    return path.join(__dirname, '..', 'tmp', filename);
}

module.exports = {
    CachedDownload,
};
