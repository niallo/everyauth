var oauthModule = require('./oauth2');

var dotcloud = module.exports =
oauthModule.submodule('dotcloud')
  .configurable({
      scope: 'specify types of access: (no scope), user, public_repo, repo, gist'
  })

  .oauthHost('https://www.dotcloud.com')
  .apiHost('https://rest.dotcloud.com/1')

  .authPath('/oauth2/authorize')
  .accessTokenPath('/oauth2/token')

  .entryPath('/auth/dotcloud')
  .callbackPath('/auth/dotcloud/callback')

  .authQueryParam('scope', function () {
    return this._scope && this.scope();
  })
  .authQueryParam('response_type', 'code')


  .fetchOAuthUser( function (accessToken) {
    var p = this.Promise();
    this.oauth.get(this.apiHost() + '/me', accessToken, function (err, data) {
      console.log("fetchOAuthUser() - error: %s data: %s", err, data);
      if (err) return p.fail(err);
      var oauthUser = JSON.parse(data).object;
      p.fulfill(oauthUser);
    })
    return p;
  })
  .moduleErrback( function (err, seqValues) {
    if (err instanceof Error) {
      var next = seqValues.next;
      return next(err);
    } else if (err.extra) {
      var ghResponse = err.extra.res
        , serverResponse = seqValues.res;
      serverResponse.writeHead(
          ghResponse.statusCode
        , ghResponse.headers);
      serverResponse.end(err.extra.data);
    } else if (err.statusCode) {
      var serverResponse = seqValues.res;
      serverResponse.writeHead(err.statusCode);
      serverResponse.end(err.data);
    } else {
      console.error(err);
      throw new Error('Unsupported error type');
    }
  });
