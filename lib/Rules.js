const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const { CachedDownload } = require('./CachedDownload');
const { StaleRulesException } = require('./Exceptions');
const path = require('path');
const { NodeVersion } = require('./NodeVersion');
const { NodeRelease } = require('./NodeRelease');
const { CveId } = require('./CveId');
const { SupportEndDate } = require('./SupportEndDate');
const { Logger } = require('./Logger');
const { CveDetails } = require('./CveDetails');

const RULES_PATH = '/../docs/rules-v1.json';
const HOSTED_RULES_PATH = 'https://www.github.developerdan.com/node-version-audit/rules-v1.json';

const Rules = {};

/**
 * @typedef Rules
 * @type {object}
 * @property {Date} lastUpdatedDate
 * @property {string} name
 * @property {string} website
 * @property {string} license
 * @property {string} source
 * @property {number} releasesCount
 * @property {number} cveCount
 * @property {number} supportVersionsCount
 * @property {NodeVersion} latestVersion
 * @property {{string: string}} latestVersions
 * @property {{string: SupportEndDate}} supportEndDates
 * @property {NodeRelease[]} releases
 * @property {Object} cves
 */

/**
 * @param {boolean} update
 * @return {Promise<{}>}
 */
async function loadRawRules(update) {
    if (update) {
        try {
            return await CachedDownload.json(HOSTED_RULES_PATH);
        } catch (e) {
            Logger.warning('Unable to download hosted rules:', e);
        }
    }

    if (fs.existsSync(path.join(__dirname, RULES_PATH))) {
        try {
            const buf = await readFile(path.join(__dirname, RULES_PATH));
            return JSON.parse(buf.toString('utf8'));
        } catch (e) {
            Logger.warning('Unable to read local rules:', e);
        }
    }

    throw StaleRulesException.fromString('Unable to load rules from disk');
}

/**
 *
 * @param update
 * @return {Promise<Rules>}
 */
Rules.loadRules = async (update) => {
    const rawRules = await loadRawRules(update);
    return transformRules(rawRules);
};

/**
 * @param {{string: NodeRelease}} releases
 * @param {{string: CveDetails}} cves
 * @param {{string: {start: Date, lts: Date, end: Date, maintenance: Date}}} supportSchedule
 * @return {Promise<void>}
 */
Rules.saveRules = (releases, cves, supportSchedule) => {
    const latestRelease = Object.values(releases).sort(NodeRelease.compare)[Object.keys(releases).length - 1];
    const rules = {
        lastUpdatedDate: new Date().toISOString(),
        name: 'Node Version Audit',
        website: 'https://github.com/lightswitch05/node-version-audit',
        license: 'https://github.com/lightswitch05/node-version-audit/blob/master/LICENSE',
        source: HOSTED_RULES_PATH,
        releasesCount: Object.keys(releases).length,
        cveCount: Object.keys(cves).length,
        supportVersionsCount: Object.keys(supportSchedule).length,
        latestVersion: latestRelease.version,
        latestVersions: releasesToLatestVersions(releases),
        supportEndDates: supportSchedule,
        releases: releases,
        cves: cves,
    };
    const data = JSON.stringify(rules, null, 4);
    return writeFile(path.join(__dirname, RULES_PATH), data);
};

/**
 * @param {Rules} rules
 */
Rules.assertFreshRules = (rules) => {
    const elapsedSeconds = (new Date().getTime() - rules.lastUpdatedDate.getTime()) / 1000;
    const elapsedDays = Math.round(elapsedSeconds / 86400);
    if (elapsedSeconds > 1209600) {
        throw StaleRulesException.fromString(`Rules are older then two weeks (${elapsedDays} days)`);
    }
    Logger.debug(`Rules are ${elapsedDays} days old`);
};

/**
 * @param {{string: NodeRelease}} releases
 * @return {*}
 */
function releasesToLatestVersions(releases) {
    const latestVersions = {};
    for (let release of Object.values(releases)) {
        const version = release.version;
        const major = `${version.major}`;
        const minor = `${version.minor}`;
        const majorAndMinor = `${major}.${minor}`;
        if (latestVersions[major]) {
            latestVersions[major] = version;
        }
        if (!latestVersions[majorAndMinor]) {
            latestVersions[majorAndMinor] = version;
        }
        if (NodeVersion.compare(version, latestVersions[major]) > 0) {
            latestVersions[major] = version;
        }
        if (NodeVersion.compare(version, latestVersions[majorAndMinor]) > 0) {
            latestVersions[majorAndMinor] = version;
        }
    }
    return latestVersions;
}

/**
 * @param {Object} rules
 * @return Rules
 */
function transformRules(rules) {
    if (!rules.lastUpdatedDate || !rules.latestVersions || !rules.latestVersion || !rules.supportEndDates) {
        throw StaleRulesException.fromString('Unable to load rules');
    }
    rules.lastUpdatedDate = new Date(rules.lastUpdatedDate);
    for (let version in rules.latestVersions) {
        rules.latestVersions[version] = NodeVersion.fromString(rules.latestVersions[version]);
    }
    rules.latestVersion = NodeVersion.fromString(rules.latestVersion);
    for (let supportVersion in rules.supportEndDates) {
        let supportVersionDates = rules.supportEndDates[supportVersion];
        let lts = supportVersionDates.lts ? new Date(supportVersionDates.lts) : null;
        rules.supportEndDates[supportVersion] = new SupportEndDate(
            new Date(supportVersionDates.start),
            lts,
            new Date(supportVersionDates.maintenance),
            new Date(supportVersionDates.end),
        );
    }
    for (let [versionString, rawRelease] of Object.entries(rules.releases)) {
        const version = NodeVersion.fromString(versionString);
        const release = new NodeRelease(version);
        release.releaseDate = new Date(rawRelease.releaseDate);
        for (let cveString of rawRelease.patchedCveIds) {
            release.addPatchedCveId(CveId.fromString(cveString));
        }
        rules.releases[versionString] = release;
    }
    return rules;
}

module.exports = {
    Rules,
};
