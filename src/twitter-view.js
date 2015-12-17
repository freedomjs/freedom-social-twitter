window.addEventListener('load', function () {
  "use strict";
  var form = document.getElementsByTagName('form')[0];
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var credentials = {
      user: form.user.value,
      password: form.password.value
    };
    parent.postMessage({cmd: 'auth', message: credentials}, '*');
    return false;
  }, true);

  window.addEventListener('message', function (m) {
    document.getElementById('output').innerText = m;
  }, true);
}, true);
