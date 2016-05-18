/**
 * @author Robin Duda
 *
 * Application plugin and Angular controller.
 */

require('ui/autoload/all');

document.title = 'Authentication - Kibana';

var app = require('ui/modules').get('apps/kbn-authentication-plugin', []);

require('ui/routes').enable();
require('ui/routes')
  .when('/:id?', {
    template: require('plugins/kbn-authentication-plugin/app.jade')
  });

app.controller('kbn-authentication-plugin', function ($scope, $http) {


  $scope.logout = function () {

    $http.post('/logout', {"kbn-version": __KBN__.version}).then(
      function success() {
        window.location = '/';
      },
      function error() {
        window.alert('Not logged in.');
        window.location = '/';
      })
  };

  $scope.init = function () {
    $http.get('/groups').then(
      function success(request) {
        $scope.groups = request.data.groups;
      },
      function error() {
        $scope.groups = '';
      })
  }
});
