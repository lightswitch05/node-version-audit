const { SUPPORT_TYPE } = require('./SupportSchedule');
const { NodeVersion } = require('./NodeVersion');

/**
 * @constructor
 */
function AuditResults() {
    this.auditVersion = null;
    this.supportType = null;
    this.latestPatchVersion = null;
    this.latestMinorVersion = null;
    this.latestVersion = null;
    this.activeSupportEndDate = null;
    this.supportEndDate = null;
    this.rulesLastUpdatedDate = null;
    this.vulnerabilities = null;
}

AuditResults.prototype.hasVulnerabilities = function () {
    return this.vulnerabilities && Object.keys(this.vulnerabilities).length > 0;
};

AuditResults.prototype.hasSupport = function () {
    return this.supportType && this.supportType !== SUPPORT_TYPE.NONE;
};

AuditResults.prototype.isLatestPatchVersion = function () {
    return NodeVersion.compare(this.auditVersion, this.latestPatchVersion) === 0;
};

AuditResults.prototype.isLatestMinorVersion = function () {
    return NodeVersion.compare(this.auditVersion, this.latestMinorVersion) === 0;
};

AuditResults.prototype.isLatestVersion = function () {
    return NodeVersion.compare(this.latestVersion, this.auditVersion) === 0;
};

AuditResults.prototype.toJSON = function () {
    const self = this;
    return {
        auditVersion: self.auditVersion,
        hasVulnerabilities: self.hasVulnerabilities(),
        hasSupport: self.hasSupport(),
        supportType: self.supportType,
        isLatestPatchVersion: self.isLatestPatchVersion(),
        isLatestMinorVersion: self.isLatestMinorVersion(),
        isLatestVersion: self.isLatestVersion(),
        latestPatchVersion: self.latestPatchVersion,
        latestMinorVersion: self.latestMinorVersion,
        latestVersion: self.latestVersion,
        activeSupportEndDate: self.activeSupportEndDate,
        supportEndDate: self.supportEndDate,
        rulesLastUpdatedDate: self.rulesLastUpdatedDate,
        vulnerabilities: self.vulnerabilities,
    };
};

module.exports = {
    AuditResults,
};
