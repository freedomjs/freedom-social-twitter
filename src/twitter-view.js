window.addEventListener('load', function () {
  "use strict";
  var form = document.getElementsByTagName('form')[0];
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var credentials = {
      consumer_key: form.consumer_key.value,
      consumer_secret: form.consumer_secret.value,
      access_token_key: form.access_token_key.value,
      access_token_secret: form.access_token_secret.value
    };
    parent.postMessage({cmd: 'auth', message: credentials}, '*');
    return false;
  }, true);

  window.addEventListener('message', function (m) {
    document.getElementById('output').innerText = m;
  }, true);
}, true);
