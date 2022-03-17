const { StaleRulesException, InvalidVersionException } = require('./Exceptions');
const { Changelogs } = require('./Changelogs');
const { Rules } = require('./Rules');
const { NodeRelease } = require('./NodeRelease');
const { NodeVersion } = require('./NodeVersion');
const { SupportSchedule } = require('./SupportSchedule');
const { CveFeed } = require('./CveFeed');

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
    Rules.assertFreshRules(await this.rules);
    return {
        auditVersion: this.auditVersion,
        vulnerabilities: await this.getVulnerabilities(),
    };
};

/**
 * @return \stdClass
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
    return dummyRelease.patchedCveIds;
};

module.exports = {
    NodeVersionAudit,
};
