const { interactionPolicy: { Prompt, base: policy }, errors } = require('../../lib'); // require('oidc-provider');

// 复制默认策略，已有登录和同意提示策略
const interactions = policy();

// 创建一个没有隐式检查的可请求提示
const selectAccount = new Prompt({
  name: 'select_account',
  requestable: true,
});

// selectAccount为第一位，顺序：select_account > login > consent
interactions.add(selectAccount, 0);

module.exports = {
  clients: [
    {
      client_id: '1',
      client_secret: '1',
      grant_types: ['refresh_token', 'authorization_code'],
      redirect_uris: ['http://localhost:8080/app1.html', 'http://localhost:8080/app2.html'],
    },
    {
      client_id: '2',
      client_secret: '2',
      grant_types: ['refresh_token', 'authorization_code'],
      redirect_uris: ['http://localhost:8080/app1.html', 'http://localhost:8080/app2.html'],
    },
    {
      client_id: 'app',
      client_secret: 'pwd',
      grant_types: ['client_credentials'],
      redirect_uris: ['http://localhost:8080/app1.html'],
      response_types: [],
    },
  ],
  interactions: {
    policy: interactions,
    url(ctx, interaction) { // eslint-disable-line no-unused-vars
      return `/interaction/${ctx.oidc.uid}`;
    },
  },
  cookies: {
    long: { signed: true, maxAge: (24 * 60 * 60) * 1000 }, // 1 day in ms
    short: { signed: true },
    keys: ['some secret key', 'and also the old rotated away some time ago', 'and one more'],
  },
  claims: {
    address: ['address'],
    email: ['email', 'email_verified'],
    phone: ['phone_number', 'phone_number_verified'],
    profile: ['birthdate', 'family_name', 'gender', 'given_name', 'locale', 'middle_name', 'name',
      'nickname', 'picture', 'preferred_username', 'profile', 'updated_at', 'website', 'zoneinfo'],
  },
  features: {
    sessionManagement: {
      enabled: true,
      keepHeaders: false,
    },

    // 允许启用"grant_type=client_credentials"
    clientCredentials: {
      enabled: true,
    },

    // 跳过输入用户名、密码阶段，为false则不跳过，必须用户手动输入。默认为true
    devInteractions: { enabled: false },

    // 启用设备授权
    deviceFlow: { enabled: true }, // defaults to false

    // 令牌自我检查
    /**
     * 默认值
     * allowedPolicy: async function introspectionAllowedPolicy(ctx, client, token) {}
     * enabled: false
     */
    introspection: { enabled: true },

    // 令牌撤销，默认false
    revocation: { enabled: true },

    // 启用资源指示器功能
    resourceIndicators: {
      enabled: true,
      getResourceServerInfo(ctx, resourceIndicator) {
        console.log('resourceIndicator', resourceIndicator);
        if (resourceIndicator === 'urn:api') {
          return {
            scope: 'read',
            audience: 'urn:api',
            accessTokenTTL: 60 * 60, // 1 hour
            accessTokenFormat: 'jwt',
          };
        }

        throw new errors.InvalidToken('不合法的token');
      },
    },
  },
  jwks: {
    keys: [
      {
        d: 'VEZOsY07JTFzGTqv6cC2Y32vsfChind2I_TTuvV225_-0zrSej3XLRg8iE_u0-3GSgiGi4WImmTwmEgLo4Qp3uEcxCYbt4NMJC7fwT2i3dfRZjtZ4yJwFl0SIj8TgfQ8ptwZbFZUlcHGXZIr4nL8GXyQT0CK8wy4COfmymHrrUoyfZA154ql_OsoiupSUCRcKVvZj2JHL2KILsq_sh_l7g2dqAN8D7jYfJ58MkqlknBMa2-zi5I0-1JUOwztVNml_zGrp27UbEU60RqV3GHjoqwI6m01U7K0a8Q_SQAKYGqgepbAYOA-P4_TLl5KC4-WWBZu_rVfwgSENwWNEhw8oQ',
        dp: 'E1Y-SN4bQqX7kP-bNgZ_gEv-pixJ5F_EGocHKfS56jtzRqQdTurrk4jIVpI-ZITA88lWAHxjD-OaoJUh9Jupd_lwD5Si80PyVxOMI2xaGQiF0lbKJfD38Sh8frRpgelZVaK_gm834B6SLfxKdNsP04DsJqGKktODF_fZeaGFPH0',
        dq: 'F90JPxevQYOlAgEH0TUt1-3_hyxY6cfPRU2HQBaahyWrtCWpaOzenKZnvGFZdg-BuLVKjCchq3G_70OLE-XDP_ol0UTJmDTT-WyuJQdEMpt_WFF9yJGoeIu8yohfeLatU-67ukjghJ0s9CBzNE_LrGEV6Cup3FXywpSYZAV3iqc',
        e: 'AQAB',
        kty: 'RSA',
        n: 'xwQ72P9z9OYshiQ-ntDYaPnnfwG6u9JAdLMZ5o0dmjlcyrvwQRdoFIKPnO65Q8mh6F_LDSxjxa2Yzo_wdjhbPZLjfUJXgCzm54cClXzT5twzo7lzoAfaJlkTsoZc2HFWqmcri0BuzmTFLZx2Q7wYBm0pXHmQKF0V-C1O6NWfd4mfBhbM-I1tHYSpAMgarSm22WDMDx-WWI7TEzy2QhaBVaENW9BKaKkJklocAZCxk18WhR0fckIGiWiSM5FcU1PY2jfGsTmX505Ub7P5Dz75Ygqrutd5tFrcqyPAtPTFDk8X1InxkkUwpP3nFU5o50DGhwQolGYKPGtQ-ZtmbOfcWQ',
        p: '5wC6nY6Ev5FqcLPCqn9fC6R9KUuBej6NaAVOKW7GXiOJAq2WrileGKfMc9kIny20zW3uWkRLm-O-3Yzze1zFpxmqvsvCxZ5ERVZ6leiNXSu3tez71ZZwp0O9gys4knjrI-9w46l_vFuRtjL6XEeFfHEZFaNJpz-lcnb3w0okrbM',
        q: '3I1qeEDslZFB8iNfpKAdWtz_Wzm6-jayT_V6aIvhvMj5mnU-Xpj75zLPQSGa9wunMlOoZW9w1wDO1FVuDhwzeOJaTm-Ds0MezeC4U6nVGyyDHb4CUA3ml2tzt4yLrqGYMT7XbADSvuWYADHw79OFjEi4T3s3tJymhaBvy1ulv8M',
        qi: 'wSbXte9PcPtr788e713KHQ4waE26CzoXx-JNOgN0iqJMN6C4_XJEX-cSvCZDf4rh7xpXN6SGLVd5ibIyDJi7bbi5EQ5AXjazPbLBjRthcGXsIuZ3AtQyR0CEWNSdM7EyM5TRdyZQ9kftfz9nI03guW3iKKASETqX2vh0Z8XRjyU',
        use: 'sig',
      }, {
        crv: 'P-256',
        d: 'K9xfPv773dZR22TVUB80xouzdF7qCg5cWjPjkHyv7Ws',
        kty: 'EC',
        use: 'sig',
        x: 'FWZ9rSkLt6Dx9E3pxLybhdM6xgR5obGsj5_pqmnz5J4',
        y: '_n8G69C-A2Xl4xUW2lF0i8ZGZnk_KPYrhv4GbTGu5G4',
      },
    ],
  },
  ttl: {
    AccessToken: 60 * 60, // 1 hour in seconds
    AuthorizationCode: 10 * 60, // 10 minutes in seconds
    IdToken: 60 * 60, // 1 hour in seconds
    DeviceCode: 10 * 60, // 10 minutes in seconds
    RefreshToken: 24 * 60 * 60, // 1 day in seconds
  },
};
