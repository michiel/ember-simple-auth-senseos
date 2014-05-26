var global = (typeof window !== 'undefined') ? window : {},
    Ember = global.Ember;

/**
  Authenticator that works with the Ruby gem
  [SenseOS](https://github.com/plataformatec/senseos).

  __As token authentication is not actually part of senseos anymore, the server
  needs to implement some customizations__ to work with this authenticator -
  see the README and
  [discussion here](https://gist.github.com/josevalim/fb706b1e933ef01e4fb6).

  _The factory for this authenticator is registered as
  `'ember-simple-auth-authenticator:senseos'` in Ember's container._

  @class SenseOS
  @namespace Authenticators
  @extends Base
*/
var SenseOS = Ember.SimpleAuth.Authenticators.Base.extend({
  /**
    The endpoint on the server the authenticator acquires the auth token
    and email from.

    @property serverTokenEndpoint
    @type String
    @default '/users/sign_in'
  */
  serverTokenEndpoint: 'https://api.sense-os.nl/',

  /**
    The senseos resource name

    @property resourceName
    @type String
    @default 'user'
  */
  resourceName: 'user',

  /**
    Restores the session from a set of session properties; __will return a
    resolving promise when there's a non-empty `user_token` and a non-empty
    `user_email` in the `properties`__ and a rejecting promise otherwise.

    @method restore
    @param {Object} properties The properties to restore the session from
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being authenticated
  */
  restore: function(properties) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!Ember.isEmpty(data.token)) {
        resolve(data);
      } else {
        reject();
      }
    });
  },

  /**
    Authenticates the session with the specified `credentials`; the credentials
    are `POST`ed to the `serverTokenEndpoint` and if they are valid the server
    returns an auth token in response . __If the credentials are
    valid and authentication succeeds, a promise that resolves with the
    server's response is returned__, otherwise a promise that rejects with the
    error is returned.

    @method authenticate
    @param {Object} options The credentials to authenticate the session with
    @return {Ember.RSVP.Promise} A promise that resolves when an auth token is successfully acquired from the server and rejects otherwise
  */
  authenticate: function(credentials) {
      return new Ember.RSVP.Promise(function(resolve, reject) {
        var data = {
          username : credentials.identification,
          /* global CryptoJS */
          password : CryptoJS.MD5(credentials.password).toString()
        };
        this.makeRequest('login.json', data).then(function(response) {
          Ember.run(function() {
            resolve({
                token : response.session_id,
                email : credentials.identification
              });
          });
        }, function(xhr, status, error) {
          Ember.run(function() {
            reject(xhr.responseJSON || xhr.responseText);
          });
        });
      }.bind(this));
  },

  /**
    Does nothing

    @method invalidate
    @return {Ember.RSVP.Promise} A resolving promise
  */
  invalidate: function() {
    return Ember.RSVP.resolve();
  },

  /**
    @method makeRequest
    @private
  */
  makeRequest: function(data, resolve, reject) {
    var url = this.serverTokenEndpoint + path;
    if (!Ember.SimpleAuth.Utils.isSecureUrl(url)) {
      Ember.Logger.warn('Credentials are transmitted via an insecure connection - use HTTPS to keep them secure.');
    }
    return Ember.$.ajax({
      url         : url,
      type        : 'POST',
      data        : JSON.stringify(data),
      dataType    : 'json',
      contentType : 'application/json; charset=UTF-8'
    });
  }
});

export { SenseOS };
