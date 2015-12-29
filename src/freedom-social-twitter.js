/* globals window:true,freedom:true,global */

/**
 * Implementation of a Social provider for freedom.js that uses Twitter
 **/

// Global declarations for node.js
if (typeof global !== 'undefined') {
  if (typeof window === 'undefined') {
    global.window = {};
  }
} else {
  if (typeof window === 'undefined') {
    var window = {};
  }
}

var BASE_URL = 'https://api.twitter.com/1.1';

var TwitterSocialProvider = function(dispatchEvent) {
  'use strict';
  this.dispatchEvent = dispatchEvent;
  this.xhr = null;
  this.credentials = null;
  this.request_options = {
    headers: {
      'Accept': '*/*',
      'Connection': 'close',
      'User-Agent': 'freedom-social-twitter/0.0.1'
    }
  };
};


/**
 * Receive credentials from client application.
 * @method onCredentials
 * @private
 * @param {function} continuation call to complete to login promise.
 * @param {object} msg The authentication message sent by the client.
 **/
TwitterSocialProvider.prototype.onCredentials = function(continuation, msg) {
  'use strict';
  if (msg.cmd && msg.cmd === 'auth') {
    this.credentials = msg.message;
    this.login(null, continuation);
  } else if (msg.cmd && msg.cmd === 'error') {
    continuation(undefined, {
      errcode: 'LOGIN_FAILEDCONNECTION',
      message: 'Failed to connect to Twitter provider'
    });
  } else {
    continuation(undefined, {
      errcode: 'LOGIN_BADCREDENTIALS',
      message: 'Bad credentials, could not log in to Twitter'
    });
  }
};


/**
 * Begin the login, potentially prompting for credentials.
 * TODO finish once Twitter supports OAuth 2
 * @method login
 * @param {Object} loginOpts Setup information about the desired network.
 */
TwitterSocialProvider.prototype.login = function(loginOpts, continuation) {
  'use strict';
  return new Promise(function(fulfillLogin, rejectLogin) {
    var OAUTH_REDIRECT_URLS = [
      "https://www.uproxy.org/oauth-redirect-uri",
      "http://freedomjs.org/",
      "http://localhost:8080/",
      "https://fmdppkkepalnkeommjadgbhiohihdhii.chromiumapp.org/"
    ];
    var oauth = freedom['core.oauth']();

    oauth.initiateOAuth(OAUTH_REDIRECT_URLS).then(function(stateObj) {
      var url = '';  // TODO Twitter doesn't support OAuth 2 yet 
      return oauth.launchAuthFlow(url, stateObj).then(function(responseUrl) {
        return responseUrl.match(/code=([^&]+)/)[1];
      });
    }).then(function(code) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'PUT URL HERE WHEN TWITTER SUPPORTS OAUTH2' + code,
               true);
      xhr.onload = function() {
        var text = xhr.responseText;
        this.access_token = text.match(/access_token=([^&]+)/)[1];
        xhr = new XMLHttpRequest();
        xhr.open('GET', 'TODO URL WHEN OAUTH2' + this.access_token, true);
        xhr.onload = function() {
          var text = xhr.responseText;
          var user = JSON.parse(text);
          var clientId = Math.random().toString();
          var clientState = {
            userId: user.login,
            clientId: clientId,
            status: "ONLINE",
            lastUpdated: Date.now(),
            lastSeen: Date.now()
          };

          this.myClientState_ = clientState;
          fulfillLogin(clientState);

          var profile = {
            userId: user.login,
            name: user.name,
            lastUpdated: Date.now(),
            url: user.html_url,
            imageData: user.avatar_url
          };
          this.addUserProfile_(profile);
          this.finishLogin_();
        }.bind(this);  // end of inner onload
        xhr.send();
      }.bind(this);  // end of outer onload
      xhr.send();
    }.bind(this));
  }.bind(this));  // end of return new Promise
};


/**
 * Clear any credentials / state in the app.
 * @method clearCachedCredentials
 */
TwitterSocialProvider.prototype.clearCachedCredentials =
  function(continuation) {
    'use strict';
    this.credentials = null;
    this.request_options.oauth = null;
    continuation();
  };


/**
 * TODO
 * Returns all the <client_state>s that we've seen so far (from any 'onClientState' event)
 * Note: this instance's own <client_state> will be somewhere in this list
 * Use the clientId returned from social.login() to extract your element
 *
 * @method getClients
 * @return {Object} {
 *    'clientId1': <client_state>,
 *    'clientId2': <client_state>,
 *     ...
 * } List of <client_state>s indexed by clientId
 *   On failure, rejects with an error code (see above)
 */
TwitterSocialProvider.prototype.getClients = function(continuation) {
  'use strict';
  continuation();
};


// TODO
TwitterSocialProvider.prototype.getUsers = function(continuation) {
  'use strict';
  continuation();
};


/**
 * Sends a message to a user via Twitter direct message.
 * If the destination is not specified or invalid, the mssage is dropped.
 * @method sendMessage
 * @param {String} to Twitter screenname of the user to send to.
 * @param {String} msg The message to send
 * @param {Function} continuation Callback after message is sent.
 */
TwitterSocialProvider.prototype.sendMessage = function(to, msg, continuation) {
  'use strict';
  if (!this.xhr) {
    console.warn('No Twitter client available to send message to ' + to);
    continuation(undefined, {
      errcode: 'OFFLINE',
      message: this.ERRCODE.OFFLINE
    });
    return;
  }
  this.client.post('direct_messages/new', {
    screen_name: to,
    text: msg
  }, continuation);
};


TwitterSocialProvider.prototype.logout = function(continuation) {
  'use strict';
  this.xhr = null;
  this.clearCachedCredentials(continuation);
};


/**
 * TODO
 * Handle messages from the Twitter client.
 * @method onMessage
 */
TwitterSocialProvider.prototype.onMessage = function(from, msg) {
  'use strict';
};

// TODO other event receiving maybe, particularly for credentials/auth


// Register provider when in a module context.
if (typeof freedom !== 'undefined') {
  if (!freedom.social) {
    freedom().provideAsynchronous(TwitterSocialProvider);
  } else {
    freedom.social().provideAsynchronous(TwitterSocialProvider);
  }
}
