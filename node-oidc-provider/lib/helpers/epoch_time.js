/**
 * 默认获取当前时间到秒，时间戳
 * @param date
 * @return {number}
 */
module.exports = (date = Date.now()) => Math.floor(date / 1000);
