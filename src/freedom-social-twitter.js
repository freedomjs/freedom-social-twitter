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
  console.log(msg);
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
 * Begin the login view, potentially prompting for credentials.
 * This is expected to be overridden by a *-auth.js file
 * @method login
 * @param {Object} loginOpts Setup information about the desired network.
 */
TwitterSocialProvider.prototype.login = function(loginOpts, continuation) {
  continuation(undefined, {
    errcode: 'UNKNOWN',
    message: 'No login function defined'
  });
};


/**
 * Private method to connect once login credentials are populated
 * @method connect
 * @private
 */
TwitterSocialProvider.prototype.connect = function(continuation) {
  if (this.credentials) {
    this.request_options[oauth] = this.credentials;
    this.xhr = freedom['core.xhr']();
    continuation();
  } else {
    continuation(undefined, {
      errcode: 'LOGIN_BADCREDENTIALS',
      message: 'No credentials provided, could not log in to Twitter'
    });
  }
};


/**
* Clear any credentials / state in the app.
* @method clearCachedCredentials
*/
TwitterSocialProvider.prototype.clearCachedCredentials =
  function(continuation) {
    'use strict';
    this.credentials = null;
    this.request_options[oauth] = null;
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
