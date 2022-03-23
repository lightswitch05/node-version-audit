const { StaleRulesException, InvalidVersionException, UnknownVersionException } = require('./Exceptions');
const { Changelogs } = require('./Changelogs');
const { Rules } = require('./Rules');
const { NodeRelease } = require('./NodeRelease');
const { NodeVersion } = require('./NodeVersion');
const { SupportSchedule } = require('./SupportSchedule');
const { CveFeed } = require('./CveFeed');

const SUPPORT_TYPE = {
    CURRENT: 'current',
    ACTIVE: 'active',
    MAINTENANCE: 'maintenance',
};

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
    this.rules = Rules.loadRules(updateRules);
}

NodeVersionAudit.prototype.fullRulesUpdate = async function () {
    console.warn('Running full rules update, this is slow and should not be ran locally!');
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

NodeVersionAudit.prototype.getAllAuditDetails = async function () {
    this.rules = await this.rules;
    Rules.assertFreshRules(this.rules);
    const self = this;
    return {
        auditVersion: self.auditVersion,
        hasVulnerabilities: await self.hasVulnerabilities(),
        hasSupport: self.hasSupport(),
        supportType: self.supportType(),
        isLatestPatchVersion: self.isLatestPatchVersion(),
        isLatestMinorVersion: self.isLatestMinorVersion(),
        isLatestVersion: self.isLatestVersion(),
        latestPatchVersion: self.getLatestPatchVersion(),
        latestMinorVersion: self.getLatestMinorVersion(),
        latestVersion: self.getLatestVersion(),
        activeSupportEndDate: self.getActiveSupportEndDate(),
        supportEndDate: self.getSupportEndDate(),
        rulesLastUpdatedDate: self.rules.lastUpdatedDate,
        vulnerabilities: await self.getVulnerabilities(),
    };
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
 * @return {Promise<boolean>}
 */
NodeVersionAudit.prototype.hasVulnerabilities = async function () {
    const vulnerabilities = await this.getVulnerabilities();
    return Object.keys(vulnerabilities).length > 0;
};

NodeVersionAudit.prototype.isLatestVersion = function () {
    const latestVersion = this.getLatestVersion();
    return NodeVersion.compare(this.auditVersion, latestVersion) === 0;
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
 * @return {boolean}
 */
NodeVersionAudit.prototype.isLatestPatchVersion = function () {
    const latestPatchVersion = this.getLatestPatchVersion();
    return NodeVersion.compare(this.auditVersion, latestPatchVersion) === 0;
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

NodeVersionAudit.prototype.isLatestMinorVersion = function () {
    const latestMinorVersion = this.getLatestMinorVersion();
    return NodeVersion.compare(this.auditVersion, latestMinorVersion) === 0;
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
    return null;
};

NodeVersionAudit.prototype.hasCurrentSupport = function () {
    const supportDates = this.getSupportDates(this.auditVersion.major);
    const endDate = supportDates.lts ?? supportDates.maintenance;
    return nowBetweenDates(supportDates.start, endDate);
};

NodeVersionAudit.prototype.hasSupport = function () {
    return this.hasCurrentSupport() || this.hasActiveLtsSupport() || this.hasMaintenanceSupport();
};

NodeVersionAudit.prototype.hasActiveLtsSupport = function () {
    const supportDates = this.getSupportDates(this.auditVersion.major);
    if (!supportDates.lts) {
        return false;
    }
    return nowBetweenDates(supportDates.lts, supportDates.maintenance);
};

NodeVersionAudit.prototype.hasMaintenanceSupport = function () {
    const supportDates = this.getSupportDates(this.auditVersion.major);
    return nowBetweenDates(supportDates.maintenance, supportDates.end);
};

NodeVersionAudit.prototype.getActiveSupportEndDate = function () {
    const supportDates = this.getSupportDates(this.auditVersion.major);
    return supportDates.maintenance;
};

NodeVersionAudit.prototype.getSupportEndDate = function () {
    const supportDates = this.getSupportDates(this.auditVersion.major);
    return supportDates.end;
};

/**
 * @param {number} major
 * @return {*}
 */
NodeVersionAudit.prototype.getSupportDates = function (major) {
    const supportDates = this.rules.supportEndDates[major.toString()];
    if (!supportDates) {
        throw UnknownVersionException.fromString(this.auditVersion.toString());
    }
    return supportDates;
};

function nowBetweenDates(start, end) {
    const now = new Date().getTime();
    return now >= start.getTime() && now < end.getTime();
}

module.exports = {
    NodeVersionAudit,
};
