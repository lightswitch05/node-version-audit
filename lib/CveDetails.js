/**
 * @param {CveId} id
 * @param {?number} baseScore
 * @param {?string} publishedDate
 * @param {?string} lastModifiedDate
 * @param {?string} description
 * @constructor
 */
const { CveId } = require('./CveId');

function CveDetails(id, baseScore, publishedDate, lastModifiedDate, description) {
    this.id = id;
    this.baseScore = baseScore;
    this.publishedDate = publishedDate;
    this.lastModifiedDate = lastModifiedDate;
    this.description = description;
}

/**
 * @param {CveDetails} first
 * @param {CveDetails} second
 */
CveDetails.compare = (first, second) => {
    return CveId.compare(first.id, second.id);
};

module.exports = {
    CveDetails,
};
