const {
    StaleRulesException,
    InvalidVersionException,
    UnknownVersionException,
    InvalidRuntimeException,
} = require('./Exceptions');
const { Changelogs } = require('./Changelogs');
const { Rules } = require('./Rules');
const { NodeRelease } = require('./NodeRelease');
const { NodeVersion } = require('./NodeVersion');
const { SupportSchedule, SUPPORT_TYPE } = require('./SupportSchedule');
const { CveFeed } = require('./CveFeed');
const { AuditResults } = require('./AuditResults');
const { SupportEndDate } = require('./SupportEndDate');
const { Logger } = require('./Logger');

/**
 * @param {string} auditVersion
 * @param {boolean} updateRules
 * @constructor
 */
function NodeVersionAudit(auditVersion, updateRules) {
    this.auditVersion = NodeVersion.fromString(auditVersion);
    if (!this.auditVersion) {
        throw InvalidVersionException.fromString(auditVersion);
    }
    assertRuntimeVersion();
    this.rules = Rules.loadRules(updateRules);
}

/**
 * @return {Promise<void>}
 */
NodeVersionAudit.prototype.fullRulesUpdate = async function () {
    Logger.warning('Running full rules update, this is slow and should not be ran locally!');
    const releases = await Changelogs.parse();
    const uniqueCves = Object.values(releases).reduce((dummyRelease, release) => {
        for (let cve of release.patchedCveIds) {
            dummyRelease.addPatchedCveId(cve);
        }
        return dummyRelease;
    }, new NodeRelease(new NodeVersion(0, 0, 0))).patchedCveIds;
    const supportSchedule = await SupportSchedule.parse();

    const cves = await CveFeed.parse(uniqueCves);

    if (
        this.rules.releasesCount > Object.keys(releases).length ||
        this.rules.cveCount > cves.length ||
        this.rules.supportEndDates > Object.keys(supportSchedule).length
    ) {
        throw StaleRulesException.fromString('Updated rules failed to meet expected counts.');
    }
    await Rules.saveRules(releases, cves, supportSchedule);
};

/**
 * @return {Promise<AuditResults>}
 */
NodeVersionAudit.prototype.getAllAuditResults = async function () {
    this.rules = await this.rules;
    Rules.assertFreshRules(this.rules);
    const auditResults = new AuditResults();
    auditResults.auditVersion = this.auditVersion;
    auditResults.supportType = this.supportType();
    auditResults.latestPatchVersion = this.getLatestPatchVersion();
    auditResults.latestMinorVersion = this.getLatestMinorVersion();
    auditResults.latestVersion = this.getLatestVersion();
    auditResults.activeSupportEndDate = this.getActiveSupportEndDate();
    auditResults.supportEndDate = this.getSupportEndDate();
    auditResults.rulesLastUpdatedDate = this.rules.lastUpdatedDate;
    auditResults.vulnerabilities = await this.getVulnerabilities();
    return auditResults;
};

/**
 *
 * @return {Promise<{}>}
 */
NodeVersionAudit.prototype.getVulnerabilities = async function () {
    const dummyRelease = new NodeRelease(new NodeVersion(0, 0, 0));
    const maxMinorVersion = new NodeVersion(this.auditVersion.major, 99999, 99999);
    for (let release of Object.values((await this.rules).releases)) {
        if (
            NodeVersion.compare(release.version, this.auditVersion) <= 0 ||
            NodeVersion.compare(release.version, maxMinorVersion) > 0
        ) {
            continue;
        }
        for (let cve of release.patchedCveIds) {
            dummyRelease.addPatchedCveId(cve);
        }
    }

    const vulnerabilities = {};
    for (let patchedCveId of dummyRelease.patchedCveIds) {
        const cveString = patchedCveId.toString();
        vulnerabilities[cveString] = null;
        if (this.rules.cves[cveString]) {
            vulnerabilities[cveString] = this.rules.cves[cveString];
        }
    }
    return vulnerabilities;
};

/**
 * @return {NodeVersion}
 */
NodeVersionAudit.prototype.getLatestVersion = function () {
    if (!this.rules.latestVersion) {
        throw StaleRulesException.fromString('Latest Node.js version is unknown!');
    }
    return this.rules.latestVersion;
};

/**
 * @return {NodeVersion}
 */
NodeVersionAudit.prototype.getLatestPatchVersion = function () {
    const majorAndMinor = `${this.auditVersion.major}.${this.auditVersion.minor}`;
    if (!this.rules.latestVersions[majorAndMinor]) {
        throw UnknownVersionException.fromString(this.auditVersion.toString());
    }
    const latestPatch = this.rules.latestVersions[majorAndMinor];
    if (NodeVersion.compare(this.auditVersion, latestPatch) > 0) {
        throw UnknownVersionException.fromString(this.auditVersion.toString());
    }
    return latestPatch;
};

/**
 * @return {NodeVersion}
 */
NodeVersionAudit.prototype.getLatestMinorVersion = function () {
    const major = this.auditVersion.major;
    if (!this.rules.latestVersions[major]) {
        throw UnknownVersionException.fromString(this.auditVersion);
    }
    return this.rules.latestVersions[major];
};

/**
 * @return {string}
 */
NodeVersionAudit.prototype.supportType = function () {
    if (this.hasCurrentSupport()) {
        return SUPPORT_TYPE.CURRENT;
    }
    if (this.hasActiveLtsSupport()) {
        return SUPPORT_TYPE.ACTIVE;
    }
    if (this.hasMaintenanceSupport()) {
        return SUPPORT_TYPE.MAINTENANCE;
    }
    return SUPPORT_TYPE.NONE;
};

/**
 * @return {boolean}
 */
NodeVersionAudit.prototype.hasCurrentSupport = function () {
    const supportDates = this.getSupportDates(this.auditVersion.major);
    const endDate = supportDates.lts || supportDates.maintenance;
    return nowBetweenDates(supportDates.start, endDate);
};

/**
 * @return {boolean}
 */
NodeVersionAudit.prototype.hasActiveLtsSupport = function () {
    const supportDates = this.getSupportDates(this.auditVersion.major);
    if (!supportDates.lts) {
        return false;
    }
    return nowBetweenDates(supportDates.lts, supportDates.maintenance);
};

/**
 * @return {boolean}
 */
NodeVersionAudit.prototype.hasMaintenanceSupport = function () {
    const supportDates = this.getSupportDates(this.auditVersion.major);
    return nowBetweenDates(supportDates.maintenance, supportDates.end);
};

/**
 * @return {Date|null}
 */
NodeVersionAudit.prototype.getActiveSupportEndDate = function () {
    const supportDates = this.getSupportDates(this.auditVersion.major);
    return supportDates.maintenance;
};

/**
 * @return {Date|null}
 */
NodeVersionAudit.prototype.getSupportEndDate = function () {
    const supportDates = this.getSupportDates(this.auditVersion.major);
    return supportDates.end;
};

/**
 * @param {number} major
 * @return {SupportEndDate}
 */
NodeVersionAudit.prototype.getSupportDates = function (major) {
    const supportDates = this.rules.supportEndDates[major.toString()];
    if (!supportDates) {
        Logger.warning('Cannot find support dates for ', this.auditVersion.toString());
        return new SupportEndDate(null, null, null, null);
    }
    return supportDates;
};

/**
 * @param {Date} start
 * @param {Date} end
 * @return {boolean}
 */
function nowBetweenDates(start, end) {
    if (!start || !end) {
        return false;
    }
    const now = new Date().getTime();
    return now >= start.getTime() && now < end.getTime();
}

/**
 * @throws {InvalidRuntimeException}
 */
function assertRuntimeVersion() {
    const minimumSupportedVersion = new NodeVersion(14, 0, 0);
    const runtimeVersion = NodeVersion.fromString(process.versions.node);
    if (NodeVersion.compare(minimumSupportedVersion, runtimeVersion) > 0) {
        throw InvalidRuntimeException.fromVersion(runtimeVersion);
    }
}

module.exports = {
    NodeVersionAudit,
};
