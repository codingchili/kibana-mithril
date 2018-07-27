/**
 * @author Robin Duda
 *
 * AJAX authentication handler for the authentication view.
 */


$(document).ready(function () {
  view.init();
});

const application = {

  submit: function () {
    view.loginStart();

    $.ajax({
      type: 'POST',
      url: '/login',
      headers: {"kbn-version": window.kbnVersion},
      data: JSON.stringify(
        {
          username: view.username.val(),
          password: view.password.val(),
          nonce: view.token.val()
        }),
      contentType: 'application/json; charset=utf-8',
      statusCode: {
        200: function () {
          location.href = '/';
        },

        406: (function (data) {
          view.showTokenView(JSON.parse(data.responseText));
        }).bind(this),

        401: (function () {
          view.authenticationFailure();
        }).bind(this)
      }
    });
  }
};

const view = {
  init: function () {
    this.header = $('#header');
    this.headerText = $('#header-text');
    this.formTwoFactor = $('#form-twofactor');
    this.svgSecret = $('#svg-secret');
    this.textSecret = $('#text-secret');
    this.token = $('#token');
    this.formLogin = $('#form-login');
    this.username = $('#username');
    this.password = $('#password');
    this.submit = $('#submig');

    this.showLogin();
  },

  loginStart: function loginStart() {
    this.submit.val('LOGGING IN...');
  },

  authenticationFailure: function () {
    this.setError("AUTHENTICATION FAILURE");
    this.submit.val('LOGIN');
    this.password.val('');
    this.showLogin();
    this.password.focus();
  },

  showLogin: function () {
    this.headerText.text('AUTHENTICATION');
    this.svgSecret.hide();
    this.textSecret.hide();
    this.formTwoFactor.hide();
    this.formLogin.show();
    this.username.focus();
  },

  clearError: function () {
    this.header.css('background-color', '#005571');
  },

  setError: function (text) {
    this.headerText.text(text);
    this.header.css('background-color', 'red');
  },

  showTokenView: function (token) {
    this.formLogin.hide();
    this.formTwoFactor.show();
    this.headerText.text('TWO-FACTOR');
    this.token.val('');
    this.token.focus();
    this.clearError();

    if (token.error)
      this.setError('INVALID KEY');

    if (!token.svg || !token.text) {
      this.svgSecret.hide();
      this.textSecret.hide();
    } else {
      this.svgSecret.show();
      this.textSecret.show();
      this.svgSecret.html(token.svg);
      this.textSecret.text(token.text);
    }
  }
};

function submit() {
  application.submit();
}

function keydown(e) {
  if (e.keyCode === 13)
    application.submit();
}
