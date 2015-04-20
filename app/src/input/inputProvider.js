'use strict';

angular.module('nemo')

    .provider('nemoInputDirectiveCreator', ['$compileProvider', 'nemoUtilsProvider', function ($compileProvider, utilsProvider) {

        function getTemplateWithAttributes(template) {
            var parentTemplateElement, templateElement;
            parentTemplateElement = document.createElement('div');
            parentTemplateElement.innerHTML = template;
            templateElement = parentTemplateElement.firstChild;
            templateElement.setAttribute('ng-model', 'model.value');
            templateElement.setAttribute('ng-focus', 'setActiveField()');
            templateElement.setAttribute('name', '{{model.name}}');
            templateElement.setAttribute('id', 'nemo-{{model.id}}');
            return parentTemplateElement.innerHTML;
        }

        function manageDefaultValue(scope, formHandlerCtrl, defaultValue) {
            var fieldName = scope.model.name,
                unregisterFn = scope.$watch(function () {
                return formHandlerCtrl.getFieldValue(fieldName);
            }, function (fieldValue) {
                if(defaultValue !== undefined && (fieldValue === null || fieldValue === undefined)) {
                    formHandlerCtrl.setFieldValue(fieldName, defaultValue);
                }
                unregisterFn();
            });
        }

        function manageCustomLinkFn(scope, element, attrs, controllers, $compile, $http, linkFn) {
            (linkFn || angular.noop)(scope, element, attrs, controllers, $compile, $http);
        }

        function getLinkFn(options, $compile, $http) {
            return function (scope, element, attrs, controllers) {
                var ngModelCtrl = controllers[0],
                    formHandlerCtrl = controllers[1];

                scope.$watch(function () {
                    return ngModelCtrl.$viewValue;
                }, function (newVal, oldVal) {
                    if (newVal === oldVal || oldVal === undefined) {
                        return;
                    }

                    formHandlerCtrl.validateForm();
                });
                registerField(scope, element, ngModelCtrl, formHandlerCtrl, options.fieldInterfaceFns);
                manageCustomLinkFn(scope, element, attrs, controllers, $compile, $http, options.linkFn);
                manageDefaultValue(scope, formHandlerCtrl, options.defaultValue);
                handleActivationState(scope, formHandlerCtrl);
            }
        }

        function handleActivationState(scope, formHandlerCtrl) {
            scope.setActiveField = function () {
                formHandlerCtrl.setActiveField(scope.model.name);
            };
        }

        function registerField(scope, element, ngModelCtrl, formHandlerCtrl, customFieldInterfaceFns) {
            var fieldInterfaceFns = getFieldInterfaceFns(scope, element, ngModelCtrl),
                customerFieldInterface = customFieldInterfaceFns ? customFieldInterfaceFns(scope, element, ngModelCtrl) : {};

            angular.extend(fieldInterfaceFns, customerFieldInterface);
            formHandlerCtrl.registerField(scope.model.name, fieldInterfaceFns);
        }

        function getFieldInterfaceFns(scope, element, ngModelCtrl) {
            return {
                activeFieldChange: function (activeField) {
                    activeFieldChange(scope, ngModelCtrl, activeField)
                },
                isValid: function () {
                    return ngModelCtrl.$valid;
                },
                isTouched: function () {
                    return ngModelCtrl.$touched;
                },
                isActive: function () {
                    return ngModelCtrl.isActive;
                },
                setFocus: function() {
                    element[0].focus();
                },
                getValue: function () {
                    return ngModelCtrl.$viewValue;
                },
                setValue: function (value) {
                    ngModelCtrl.$setViewValue(value);
                    ngModelCtrl.$render();
                },
                getNgModelCtrl: function () {
                    return ngModelCtrl;
                },
                setFilthy: function () {
                    ngModelCtrl.$setDirty();
                    ngModelCtrl.$setTouched();
                }
            }
        }

        function activeFieldChange(scope, ngModelCtrl, activeField) {
            ngModelCtrl.isActive = (activeField === scope.model.name);
        }

        function getDirectiveDefinitionObject(options, $compile, $http) {
            return {
                require: ['ngModel', '^nemoFormHandler'],
                template: getTemplateWithAttributes(options.template),
                replace: true,
                restrict: 'A',
                link: getLinkFn(options, $compile, $http),
                controller: options.controller
            }
        }

        function input(type, options) {
            $compileProvider.directive
                .apply(null, [
                    'input' + utilsProvider.capitalise(type),
                    ['$compile', '$http', function ($compile, $http) {
                        return getDirectiveDefinitionObject(options, $compile, $http);
                }]]);
            return this;
        }

        return {
            input: input,
            $get: angular.noop
        }
    }]);
