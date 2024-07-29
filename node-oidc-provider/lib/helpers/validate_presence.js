const formatters = require('./formatters');
const { InvalidRequest } = require('./errors');

module.exports = function validatePresence(ctx, ...required) {
  const { params } = ctx.oidc;

  // 创建一个数组，包含所有缺失的必需参数
  const missing = required.map((param) => {
    // 如果 params 中没有找到某个必需参数将其添加到 missing 数组中
    if (params[param] === undefined) {
      return param;
    }

    return undefined;
  }).filter(Boolean);

  // 如果missing长度代表确实参数的个数，这里抛出错误
  if (missing.length) {
    throw new InvalidRequest(`missing required ${formatters.pluralize('parameter', missing.length)} ${formatters.formatList(missing)}`);
  }
};
