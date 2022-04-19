/**
 * @param {Date|null} start
 * @param {Date|null} lts
 * @param {Date|null} maintenance
 * @param {Date|null} end
 * @constructor
 */
function SupportEndDate(start, lts, maintenance, end) {
    this.start = start;
    if (lts) {
        this.lts = lts;
    }
    this.maintenance = maintenance;
    this.end = end;
}

module.exports = {
    SupportEndDate,
};
