/**
 * @author Robin Duda
 *
 * AJAX authentication handler for the authentication view.
 */
document.addEventListener("DOMContentLoaded", () => {
    view.init();
});

const application = {

  submit: () => {
    view.loginStart();

    let xhr = new XMLHttpRequest();
    xhr.open("POST", window.basePath + '/mithril', true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.setRequestHeader('kbn-version', window.kbnVersion);

    xhr.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE) {
            switch (this.status) {
                case 200:
                    if (window.basePath === '') {
                        location.href = '/';
                    } else {
                        location.href = window.basePath;
                    }
                    break;
                case 406:
                    view.showTokenView(JSON.parse(this.responseText));
                    break;
                case 401:
                    view.authenticationFailure();
                    break;
                default:
                    console.log("unexpected response: " + this.status + " " + this.responseText);
            }
        }
    };

    xhr.send(JSON.stringify({
           username: view.username.value,
           password: view.password.value,
           nonce: view.token.value
        })
     );
  }
};

const view = {
  init: function () {
    this.header = query('#header');
    this.headerText = query('#header-text');
    this.formTwoFactor = query('#form-twofactor');
    this.svgSecret = query('#svg-secret');
    this.textSecret = query('#text-secret');
    this.token = query('#token');
    this.formLogin = query('#form-login');
    this.username = query('#username');
    this.password = query('#password');
    this.submit = query('#submit');

    this.showLogin();
  },

  loginStart: function loginStart() {
    this.submit.textContent = 'LOGGING IN...';
  },

  authenticationFailure: function () {
    this.setError("AUTHENTICATION FAILURE");
    this.submit.textContent = 'LOGIN';
    this.password.value = '';
    this.showLogin();
    this.password.focus();
  },

  showLogin: function () {
    this.headerText.textContent = 'AUTHENTICATION';
    hide(this.svgSecret);
    hide(this.textSecret)
    hide(this.formTwoFactor);
    show(this.formLogin);
    this.username.focus();
  },

  clearError: function () {
    this.header.style['background-color'] = '#005571';
  },

  setError: function (text) {
    this.headerText.textContent = text;
    this.header.style['background-color'] = 'red';
  },

  showTokenView: function (token) {
    hide(this.formLogin);
    show(this.formTwoFactor);
    this.headerText.textContent = 'TWO-FACTOR';
    this.submit.textContent = 'LOGIN';
    this.token.value = '';
    this.token.focus();
    this.clearError();

    if (token.error) {
      this.setError('INVALID KEY');
    }

    if (!token.svg || !token.text) {
      hide(this.svgSecret);
      hide(this.textSecret);
    } else {
      show(this.svgSecret);
      show(this.textSecret);
      this.svgSecret.innerHTML = token.svg;
      this.textSecret.textContent = token.text;
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

function hide(element) {
    element.style.display = 'none';
}

function show(element) {
    element.style.display = 'block';
}

function query(selector) {
    return document.querySelector(selector);
}