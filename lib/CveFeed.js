const { CachedDownload } = require('./CachedDownload');
const { ParseException } = require('./Exceptions');
const { CveId } = require('./CveId');
const { CveDetails } = require('./CveDetails');

const CVE_START_YEAR = 2013;

const CveFeed = {};

/**
 * @param {CveId[]}cveIds
 */
CveFeed.parse = async (cveIds) => {
    const feedNames = ['modified', 'recent'];
    const currentYear = new Date().getFullYear();
    for (let year = CVE_START_YEAR; year <= currentYear; year++) {
        feedNames.push(year.toString());
    }
    let cveDetails = {};
    for (let feedName of feedNames) {
        cveDetails = Object.assign(cveDetails, await parseFeed(cveIds, feedName));
    }
    return cveDetails;
};

/**
 *
 * @param {CveId[]} cveIds
 * @param {string} feedName
 */
async function parseFeed(cveIds, feedName) {
    console.info('Beginning NVD feed parse: ', feedName);
    const cveDetails = {};
    let cveFeed = await downloadFeed(feedName);
    const cvesSet = new Set(cveIds.map((cve) => cve.toString()));

    for (let cveItem of cveFeed.CVE_Items) {
        const cve = parseCveItem(cveItem);
        if (cve && cvesSet.has(cve.id.toString())) {
            cveDetails[cve.id.toString()] = cve;
        }
    }
    return cveDetails;
}

/**
 * @param {string} feedName
 * @return {*}
 */
function downloadFeed(feedName) {
    try {
        return CachedDownload.json(`https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-${feedName}.json.gz`);
    } catch (ex) {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        if (feedName === currentYear.toString() && currentMonth === 0) {
            console.warn(`Unable to download feed ${feedName}. Skipping due to beginning of the year.`);
            return {
                CVE_Items: [],
            };
        } else {
            throw new ParseException.fromException(ex);
        }
    }
}

/**
 * @param cveItem
 * @return {null|CveDetails}
 */
function parseCveItem(cveItem) {
    if (!cveItem.cve.CVE_data_meta.ID) {
        return null;
    }
    const id = CveId.fromString(cveItem.cve.CVE_data_meta.ID);
    if (id === null) {
        return null;
    }
    const publishedDate = new Date(cveItem.publishedDate).toISOString();
    const lastModifiedDate = new Date(cveItem.lastModifiedDate).toISOString();
    let description = null;
    let baseScore = null;
    if (cveItem.cve.description.description_data) {
        for (let descriptionLang of cveItem.cve.description.description_data) {
            if (descriptionLang.lang === 'en') {
                description = descriptionLang.value;
                break;
            }
        }
    }

    if (cveItem.impact.baseMetricV3 && cveItem.impact.baseMetricV3.cvssV3.baseScore) {
        baseScore = cveItem.impact.baseMetricV3.cvssV3.baseScore;
    } else if (cveItem.impact.baseMetricV2 && cveItem.impact.baseMetricV2.cvssV2.baseScore) {
        baseScore = cveItem.impact.baseMetricV2.cvssV2.baseScore;
    }
    return new CveDetails(id, baseScore, publishedDate, lastModifiedDate, description);
}

module.exports = {
    CveFeed,
};
