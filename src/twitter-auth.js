/*globals freedom:true,setTimeout,console,VCardStore,TwitterSocialProvider */
/*jslint indent:2,white:true,sloppy:true */

TwitterSocialProvider.prototype.oAuthRedirectUris = [
  'https://fmdppkkepalnkeommjadgbhiohihdhii.chromiumapp.org/',
  'https://www.uproxy.org/oauth-redirect-uri',
  'http://freedomjs.org/',
  'http://localhost:8000/'
];

/**
 * Begin the login view, potentially prompting for credentials.
 * @method login
 * @param {Object} loginOpts Setup information about the desired network.
 *   keys used by this provider include
 *   agent - The user agent to expose on the network
 *   url - The url of the client connecting
 *   version - The version of the client.
 *   network - A string used to differentiate this provider in events.
 */
TwitterSocialProvider.prototype.login = function(loginOpts, continuation) {
  if (loginOpts) {
    this.loginOpts = loginOpts;
  }

  if (!this.credentials) {
    if (this.view) {
      this.view.close();
    }
    this.view = freedom['core.view']();
    this.view.once('message', this.onCredentials.bind(this, continuation));
    this.view.on('message', this.view.close.bind(this.view));
    this.view.show('twitter-login');
    return;
  }
  this.connect(continuation);
};

TwitterSocialProvider.prototype.getOauthAccessToken = function(continuation) {
  this.oauth = freedom['core.oauth']();
  this.oauth.initiateOAuth(this.oAuthRedirectUris).then(function(stateObj) {
    var oauth_url = 'https://api.twitter.com/oauth/authenticate' +
        'client_id=' + this.oAuthClientId +
        '&redirect_uri=' + encodeURIComponent(stateObj.redirect) +
        "&state=" + encodeURIComponent(stateObj.state) +
        "&response_type=token";
    //encodeURIComponent(oauthUrl);
    return this.oauth.launchAuthFlow(url, stateObj);
  }.bind(this)).then(function(continuation, responseUrl) {
    /*var token = responseUrl.match(/access_token=([^&]+)/)[1];
      var xhr = freedom["core.xhr"]();
      xhr.open('GET', 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json', true);
      xhr.on("onload", function(continuation, token, xhr) {
      xhr.getResponseText().then(function(continuation, token, responseText) {
      var response = JSON.parse(responseText);
      var credentials = {
      userId: response.email,
      jid: response.email,
      oauth2_token: token,
      oauth2_auth: 'http://www.google.com/talk/protocol/auth',
      host: 'talk.google.com'
      };
      this.onCredentials(continuation, {cmd: 'auth', message: credentials});
      }.bind(this, continuation, token));
      }.bind(this, continuation, token, xhr));
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.send();*/
  }.bind(this, continuation)).catch(function (continuation, err) {
    console.error('Error in getAccessTokenWithOAuth_', err);
    continuation(undefined, {
      errcode: 'LOGIN_OAUTHERROR',
      message: err.message
    });
  }.bind(this, continuation));
};
