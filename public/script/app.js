/**
 * @author Robin Duda
 *
 * Application plugin and Angular controller.
 */

import angular from 'angular';
import routes from 'ui/routes';
import chrome from 'ui/chrome';

import { uiModules } from 'ui/modules';

import 'ui/autoload/styles';
import template from '../app.html'

import '../style/app.css';
import '../style/style.css';

document.title = 'Authentication - Kibana';

var app = uiModules.get('app/kibana-mithril', []);

routes.enable();
routes.when('/', {
    template: template,
    reloadOnSearch: false
});

app.controller('kibana-mithril', ($scope, $http) => {


  $scope.logout = () => {

    $http.post(chrome.addBasePath('/logout'), {}).then(
      function success() {
        window.location = chrome.addBasePath('/');
      },
      function error() {
        window.alert('Not logged in.');
        window.location = chrome.addBasePath('/');
      })
  };

  $scope.init = () => {
    $http.get(chrome.addBasePath('/groups')).then(
      function success(request) {
        $scope.groups = request.data.groups;
      },
      function error() {
        $scope.groups = '';
      })
  }
});
