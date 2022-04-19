const { InvalidVersionException } = require('../../lib/Exceptions');
const { NodeVersionAudit } = require('../../lib/NodeVersionAudit');
const { NodeVersion } = require('../../lib/NodeVersion');

describe('NodeVersionAudit', () => {
    it('throws on null version', () => {
        expect(() => {
            NodeVersionAudit(null, false);
        }).toThrowError(InvalidVersionException);
    });

    it('get the audit results of 0.10.0', async () => {
        const versionAudit = new NodeVersionAudit('0.10.0', false);
        const auditResults = await versionAudit.getAllAuditResults();
        expect(auditResults).toBeDefined();
        expect(auditResults.auditVersion).toEqual(NodeVersion.fromString('0.10.0'));
        expect(auditResults.supportType).toBe('none');
        expect(Object.keys(auditResults.vulnerabilities).length).toBeGreaterThan(19);
    });

    it('get the audit results of 17.8.0', async () => {
        const versionAudit = new NodeVersionAudit('17.8.0', false);
        const auditResults = await versionAudit.getAllAuditResults();
        expect(auditResults).toBeDefined();
        expect(auditResults.auditVersion).toEqual(NodeVersion.fromString('17.8.0'));
        expect(auditResults.supportType).not.toBe('none');
    });

    it('get the audit results of 16.14.2', async () => {
        const versionAudit = new NodeVersionAudit('16.14.2', false);
        const auditResults = await versionAudit.getAllAuditResults();
        expect(auditResults).toBeDefined();
        expect(auditResults.auditVersion).toEqual(NodeVersion.fromString('16.14.2'));
    });
});
