var global = (typeof window !== 'undefined') ? window : {},
    Ember = global.Ember;

/**
  Authenticator that works with CommonSense / SenseOS
  [SenseOS](http://sense-os.nl) by sending the `X-SESSION_ID`
  propertiy from the session in the request header.

  _The factory for this authorizer is registered as
  `'ember-simple-auth-authorizer:senseos'` in Ember's container._

  @class SenseOS
  @namespace Authorizers
  @extends Base
*/
var SenseOS = Ember.SimpleAuth.Authorizers.Base.extend({
  /**
    Authorizes an XHR request by sending the `user_token` and `user_email`
    properties from the session in the `Authorization` header:

    ```
    Authorization: Token token="<user_token>", user_email="<user_email>"
    ```

    @method authorize
    @param {jqXHR} jqXHR The XHR request to authorize (see http://api.jquery.com/jQuery.ajax/#jqXHR)
    @param {Object} requestOptions The options as provided to the `$.ajax` method (see http://api.jquery.com/jQuery.ajaxPrefilter/)
  */

  authorize: function(jqXHR, requestOptions) {
    var accessToken = this.get('session.token');
    if (this.get('session.isAuthenticated') && !Ember.isEmpty(accessToken)) {
      if (!Ember.SimpleAuth.Utils.isSecureUrl(requestOptions.url)) {
        Ember.Logger.warn('Credentials are transmitted via an insecure connection - use HTTPS to keep them secure.');
      }
      jqXHR.setRequestHeader('X-SESSION_ID', accessToken);
    }
  }
});

export { SenseOS };
