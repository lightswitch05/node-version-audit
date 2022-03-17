const { NodeRelease } = require('../lib/NodeRelease');
const { NodeVersion } = require('../lib/NodeVersion');
const { CveId } = require('../lib/CveId');

const NODE_VERSION = new NodeVersion(17, 0, 0);

describe('NodeRelease::addPatchedCveId', () => {
    it('keeps the CVE list sorted and duplicate free', () => {
        const a = CveId.fromString('CVE-2019-50000');
        const b = CveId.fromString('CVE-2020-40000');
        const c = CveId.fromString('CVE-2020-50000');
        const cc = CveId.fromString('CVE-2020-50000');
        const d = CveId.fromString('CVE-2020-50001');
        const e = CveId.fromString('CVE-2021-50000');

        const nodeRelease = new NodeRelease(NODE_VERSION);
        nodeRelease.addPatchedCveId(c);
        nodeRelease.addPatchedCveId(cc);
        nodeRelease.addPatchedCveId(d);
        nodeRelease.addPatchedCveId(b);
        nodeRelease.addPatchedCveId(a);
        nodeRelease.addPatchedCveId(e);
        expect(nodeRelease.patchedCveIds).toEqual([a, b, c, d, e]);
    });
});
