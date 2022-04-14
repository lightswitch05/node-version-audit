/**
 * @param {CveId} id
 * @param {?number} baseScore
 * @param {?string} publishedDate
 * @param {?string} lastModifiedDate
 * @param {?string} description
 * @constructor
 */
function CveDetails(id, baseScore, publishedDate, lastModifiedDate, description) {
    this.id = id;
    this.baseScore = baseScore;
    this.publishedDate = publishedDate;
    this.lastModifiedDate = lastModifiedDate;
    this.description = description;
}

module.exports = {
    CveDetails,
};
