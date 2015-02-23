'use strict';

angular.module('nemo')

    .provider('validation', ['$compileProvider', 'utilsProvider', function ($compileProvider, utilsProvider) {

        var validationsCache = {};

        function setupValidationRule(validationRule, ngModelController, formHandlerController, validateFn, messages) {
            ngModelController.$validators[validationRule.code] = function (viewValue, modelValue) {
                var isValid = (validateFn) ?
                    validateFn(modelValue, validationRule.value, formHandlerController, ngModelController) :
                    true;
                return isValid;
            };
            messages.set(validationRule.code, validationRule.message);
        }

        function getLinkFn(directiveName, validateFn, messages) {
            return function (scope, element, attrs, controllers) {
                var validationRules = scope.$eval(attrs[directiveName]),
                    ngModelController = controllers[0],
                    formHandlerController = controllers[1];
                validationRules.forEach(function (validationRule) {
                    setupValidationRule(validationRule, ngModelController, formHandlerController, validateFn, messages);
                });
            }
        }

        function getDirectiveDefinitionObject(directiveName, validateFn, messages) {
            return {
                require: ['ngModel', '^formHandler'],
                restrict: 'A',
                link: getLinkFn(directiveName, validateFn, messages)
            };
        }

        function validation(type, options) {

            storeValidationInCache(type, options);

            var directiveName = 'validation' + utilsProvider.capitalise(type);
            $compileProvider.directive
                .apply(null, [directiveName, ['messages', function (messages) {
                    return getDirectiveDefinitionObject(directiveName, options.validateFn, messages);
                }]]);

            return this;
        }

        function storeValidationInCache(type, options) {
            validationsCache[type] = options;
        }

        function getValidationFromCache(type) {
            return validationsCache[type];
        }

        return {
            validation: validation,
            $get: function () {
                return {
                    getValidation: getValidationFromCache
                }
            }
        }
    }]);
