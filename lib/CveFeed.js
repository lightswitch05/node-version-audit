const { CachedDownload } = require('./CachedDownload');
const { ParseException } = require('./Exceptions');
const { CveId } = require('./CveId');
const { CveDetails } = require('./CveDetails');
const { Logger } = require('./Logger');

const CVE_START_YEAR = 2013;

const CveFeed = {};

/**
 * @param {CveId[]} cveIds
 * @return {Promise<{string: CveDetails}>}
 */
CveFeed.parse = async (cveIds) => {
    const feedNames = ['modified', 'recent'];
    const currentYear = new Date().getFullYear();
    for (let year = CVE_START_YEAR; year <= currentYear; year++) {
        feedNames.push(year.toString());
    }
    let cveDetails = [];
    for (let feedName of feedNames) {
        let cveFeed = await CveFeed._downloadFeed(feedName);
        Logger.info('Beginning NVD feed parse: ', feedName);
        cveDetails = cveDetails.concat(CveFeed._parseFeed(cveIds, cveFeed));
    }
    cveDetails.sort(CveDetails.compare);
    return cveDetails.reduce((sortedCveDetails, cveDetail) => {
        if (!sortedCveDetails[cveDetail.id.toString()]) {
            sortedCveDetails[cveDetail.id.toString()] = cveDetail;
        }
        return sortedCveDetails;
    }, {});
};

/**
 * @param {CveId[]} cveIds
 * @param {*} cveFeed
 * @return {CveDetails[]}
 * @private
 */
CveFeed._parseFeed = function (cveIds, cveFeed) {
    const cveDetails = [];
    const cvesSet = new Set(cveIds.map((cve) => cve.toString()));

    for (let cveItem of cveFeed.CVE_Items) {
        const cve = CveFeed._parseCveItem(cveItem);
        if (cve && cvesSet.has(cve.id.toString())) {
            cveDetails.push(cve);
            cvesSet.delete(cve.id.toString());
        }
    }
    return cveDetails;
};

/**
 * @param {string} feedName
 * @throws {ParseException}
 * @return {*}
 */
CveFeed._downloadFeed = async function (feedName) {
    try {
        return await CachedDownload.json(`https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-${feedName}.json.gz`);
    } catch (ex) {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        if (feedName === currentYear.toString() && currentMonth === 0) {
            Logger.warn(`Unable to download feed ${feedName}. Skipping due to beginning of the year.`);
            return {
                CVE_Items: [],
            };
        } else {
            throw ParseException.fromException(ex);
        }
    }
};

/**
 * @param cveItem
 * @return {null|CveDetails}
 */
CveFeed._parseCveItem = function (cveItem) {
    let id = null;
    try {
        id = CveId.fromString(cveItem.cve.CVE_data_meta.ID);
    } catch (e) {
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
};

module.exports = {
    CveFeed,
};
