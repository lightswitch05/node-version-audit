const { CachedDownload } = require('./CachedDownload');

const SUPPORT_SCHEDULE_URL = 'https://raw.githubusercontent.com/nodejs/Release/main/schedule.json';

const SupportSchedule = {};

/**
 *
 * @return {Promise<{}>}
 */
SupportSchedule.parse = async function () {
    const supportSchedule = {};
    const supportScheduleRaw = await CachedDownload.json(SUPPORT_SCHEDULE_URL);
    for (let rawVersion in supportScheduleRaw) {
        if (rawVersion.startsWith('v0')) {
            continue;
        }
        const version = rawVersion.replace('v', '');
        supportSchedule[version] = {};
        for (let property of ['start', 'lts', 'maintenance', 'end']) {
            if (supportScheduleRaw[rawVersion][property]) {
                supportSchedule[version][property] = new Date(supportScheduleRaw[rawVersion][property]);
            }
        }
    }
    return supportSchedule;
};

module.exports = {
    SupportSchedule,
};
