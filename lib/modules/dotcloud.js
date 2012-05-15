var oauthModule = require('./oauth2');
var qs = require('querystring');
var request = require('request');

var dotcloud = module.exports =
oauthModule.submodule('dotcloud')
  .configurable({
      scope: 'specify types of access: (no scope), user, public_repo, repo, gist'
  })

  .oauthHost('https://oauth2.dotcloud.com')
  .apiHost('https://api-experimental.dotcloud.com/1')

  .authPath('/oauth2/authorize')
  .authQueryParam('response_type', 'code')

  .accessTokenPath('/oauth2/token')
  .accessTokenParam('grant_type', 'authorization_code')
  .postAccessTokenParamsVia("data")

  .entryPath('/auth/dotcloud')
  .callbackPath('/auth/dotcloud/callback')

  .fetchOAuthUser( function (accessToken) {
    var p = this.Promise();
    var url = this.apiHost() + '/me?' + qs.stringify({access_token:accessToken});
    var headers = { "Accept" : "application/json"};
    var opts = {
      method: "GET",
      headers: headers,
      uri: url
    };

    request(opts , function (err, response, body) {
      if (err) return p.fail(err);
      var oauthUser;
      try {
        oauthUser = JSON.parse(body)['object'];
        p.fulfill(oauthUser);
      } catch (e) {
        console.log("everyauth error parsing dotcloud JSON response body: %s", body)
        p.fail("everyauth error parsing dotcloud JSON response");
      }
    });
    return p;
  });
