/* eslint-disable no-console */

const path = require('path');
const url = require('url');

const set = require('lodash/set');
const express = require('express'); // eslint-disable-line import/no-unresolved
const helmet = require('helmet');

const { Provider } = require('../lib'); // require('oidc-provider');

const Account = require('./support/account');
const configuration = require('./support/configuration');
const routes = require('./routes/express');
const RedisAdapter = require('./adapters/redis');

const { PORT = 3000, ISSUER = `http://localhost:${PORT}` } = process.env;
configuration.findAccount = Account.findAccount;
const provider = new Provider(ISSUER, { adapter: RedisAdapter, ...configuration });
const handleClientAuthErrors = ({ headers: { authorization }, oidc: { body, client } }, err) => {
  console.log('debug', err);
  if (err.statusCode === 401 && err.message === 'invalid_client') {
    console.log(err);
  }
};
provider.on('grant.error', handleClientAuthErrors);
provider.on('introspection.error', handleClientAuthErrors);
provider.on('revocation.error', handleClientAuthErrors);

const app = express();
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use((req, res, next) => {
  const orig = res.render;
  // you'll probably want to use a full-blown render engine capable of layouts
  res.render = (view, locals) => {
    app.render(view, locals, (err, html) => {
      if (err) throw err;
      orig.call(res, '_layout', {
        ...locals,
        body: html,
      });
    });
  };
  next();
});

let server;
(async () => {
  if (process.env.NODE_ENV === 'production') {
    app.enable('trust proxy');
    provider.proxy = true;
    set(configuration, 'cookies.short.secure', true);
    set(configuration, 'cookies.long.secure', true);

    app.use((req, res, next) => {
      if (req.secure) {
        next();
      } else if (req.method === 'GET' || req.method === 'HEAD') {
        res.redirect(url.format({
          protocol: 'https',
          host: req.get('host'),
          pathname: req.originalUrl,
        }));
      } else {
        res.status(400).json({
          error: 'invalid_request',
          error_description: 'do yourself a favor and only use https',
        });
      }
    });
  }

  routes(app, provider);
  app.use(provider.callback);
  server = app.listen(PORT, () => {
    console.log(`application is listening on port ${PORT}, check its /.well-known/openid-configuration`);
  });
})().catch((err) => {
  if (server && server.listening) server.close();
  console.error(err);
  process.exitCode = 1;
});
