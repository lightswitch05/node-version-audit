const { CachedDownload } = require('./CachedDownload');
const { CveId } = require('./CveId');
const { NodeVersion } = require('./NodeVersion');
const { NodeRelease } = require('./NodeRelease');
const { Logger } = require('./Logger');

const CHANGELOGS_URL = 'https://api.github.com/repos/nodejs/node/contents/doc/changelogs';

const Changelogs = {};

/**
 *
 * @return {Promise<{string: NodeRelease}>}
 */
Changelogs.parse = async function () {
    const changelogUrls = await Changelogs.getChangelogUrls();
    const fullChangelog = (await Promise.all(changelogUrls.map(CachedDownload.download))).join('\n');
    return Changelogs.parseChangelog(fullChangelog);
};

/**
 * @return {Promise<string[]>}
 */
Changelogs.getChangelogUrls = async function () {
    const folderContent = await CachedDownload.json(CHANGELOGS_URL);
    // Accept only file names matching CHANGELOG_VXX or CHANGELOG_IOJS.md
    const filenamePattern = new RegExp(/^CHANGELOG_(V\d+|IOJS)\.md$/);
    return folderContent.reduce((urls, fileOrFolder) => {
        if (fileOrFolder.type === 'file' && filenamePattern.test(fileOrFolder.name)) {
            Logger.debug('Changelog URL found', fileOrFolder.name);
            urls.push(fileOrFolder.download_url);
        } else {
            Logger.debug('Excluding changelog', fileOrFolder.type, fileOrFolder.name);
        }
        return urls;
    }, []);
};

/**
 * @param {string} changelog
 * @return {{string: NodeRelease}}
 */
Changelogs.parseChangelog = function (changelog) {
    let releases = [];
    let currentRelease = null;
    const versionBlockMatch = new RegExp(/<a id="(\d+.\d+.\d+)"><\/a>$/);
    for (const line of changelog.split('\n')) {
        const matches = versionBlockMatch.exec(line);
        if (matches && matches.length === 2) {
            const foundVersion = NodeVersion.fromString(matches[1]);
            currentRelease = new NodeRelease(foundVersion);
            releases.push(currentRelease);
            continue;
        }
        if (!currentRelease) {
            continue;
        }
        if (!currentRelease.releaseDate) {
            const releaseDateMatch = line.match(/## (\d{4}-\d{1,2}-\d{1,2}),.+Version.+/i);
            if (releaseDateMatch && releaseDateMatch.length === 2) {
                currentRelease.releaseDate = new Date(releaseDateMatch[1]);
                continue;
            }
        }
        const cveMatches = line.matchAll(/(CVE-\d{4}-\d+)/gi);
        for (const cveMatch of cveMatches) {
            currentRelease.addPatchedCveId(CveId.fromString(cveMatch[1]));
        }
    }
    releases = releases.sort((a, b) => {
        return NodeVersion.compare(a.version, b.version);
    });
    return releases.reduce((releasesByKey, release) => {
        releasesByKey[release.version.toString()] = release;
        return releasesByKey;
    }, {});
};

module.exports = {
    Changelogs,
};
