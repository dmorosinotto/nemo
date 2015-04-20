angular.module('nemo', [])

    .config(['nemoInputDirectiveCreatorProvider', 'nemoValidationDirectiveCreatorProvider', 'nemoUtilsProvider', 'captchaProvider', 'checkboxProvider',
        function (inputProvider, validationProvider, utilsProvider, captchaProvider, checkboxProvider) {

            inputProvider

                .input('text', {
                    template: '<input type="text" />',
                    defaultValue: ''
                })

                .input('select', {
                    template: '<select data-ng-options="option.value as option.text for option in model.options"><option value="">Please select...</option></select>',
                    defaultValue: ''
                })

                .input('hidden', {
                    template: '<input type="hidden" />',
                    defaultValue: ''
                })

                .input('password', {
                    template: '<input type="password" />',
                    defaultValue: ''
                })

                .input('email', {
                    template: '<input type="text" />',
                    defaultValue: ''
                })

                .input('checkbox', checkboxProvider)

                .input('captcha', captchaProvider);

            validationProvider

                .validation('required', {
                    validateFn: function (value, validationRule, formHandlerController, ngModelController) {
                        return (validationRule.value) ? !ngModelController.$isEmpty(value) : true;
                    }
                })

                .validation('inlist', {
                    validateFn: function (value, validationRule) {
                        return (value) ? utilsProvider.contains(validationRule.value, value) : true;
                    }
                })

                .validation('pattern', {
                    validateFn: function (value, validationRule) {
                        return (value) ? new RegExp(validationRule.value).test(value) : true;
                    }
                })

                .validation('notpattern', {
                    validateFn: function (value, validationRule) {
                        return (value) ? !(new RegExp(validationRule.value).test(value)) : true;
                    }
                })

                .validation('mustnotcontain', {
                    validateFn: function (value, validationRule, formHandlerController) {
                        var targetValue = formHandlerController.getFieldValue(validationRule.value);
                        return (value && targetValue) ? value.indexOf(targetValue) < 0 : true;
                    }
                })

                .validation('mustmatch', {
                    preCompileFn: function (tElement) {
                        tElement.attr('nemo-no-paste', 'true');
                    },
                    validateFn: function (value, validationRule, formHandlerController) {
                        var targetValue = formHandlerController.getFieldValue(validationRule.value);
                        return (value) ? value === targetValue : true;
                    }
                })

                .validation('mustmatchcaseinsensitive', {
                    preCompileFn: function (tElement) {
                        tElement.attr('nemo-no-paste', 'true');
                    },
                    validateFn: function (value, validationRule, formHandlerController) {
                        var targetValue = formHandlerController.getFieldValue(validationRule.value);
                        return (value && targetValue) ? value.toLowerCase() === targetValue.toLowerCase() : true;
                    }
                })

                .validation('minlength', {
                    validateFn: function (value, validationRule) {
                        return (value && validationRule) ? value.length >= validationRule.value : true;
                    }
                })

                .validation('maxlength', {
                    validateFn: function (value, validationRule) {
                        return (value && validationRule) ? value.length <= validationRule.value : true;
                    }
                })

                .validation('email', {
                    validateFn: function (value, validationRule) {
                        if (value && validationRule.value) {
                            return new RegExp(/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i).test(value);
                        }
                        return true;
                    }
                })

                .validation('mustbeequal', {
                    validateFn: function (value, validationRule) {
                        return (value || value === false) ? value === validationRule.value : true;
                    }
                })

                .validation('dependentpattern', {
                    validateFn: function (value, validationRule, formHandlerController) {
                        var otherFieldValue = formHandlerController.getFieldValue(validationRule.value),
                            regex = validationRule.patterns[otherFieldValue];
                        return (value) ? new RegExp(regex, 'i').test(value) : true;
                    }
                })

                .validation('dependentrequired', {
                    validateFn: function (value, validationRule, formHandlerController, ngModelController) {
                        var otherFieldValue = formHandlerController.getFieldValue(validationRule.value),
                            required = utilsProvider.contains(validationRule.when, otherFieldValue);

                        return required ? !ngModelController.$isEmpty(value) : true;
                    }
                })

                .validation('usernameserver', {})

                .validation('emailserver', {})

                .validation('transactionCompleteserver', {})

                .validation('captchaserver', {
                    validationRuleInterfaceFns: function(scope, ngModelCtrl) {
                        return {
                            forceInvalid: function (validationRuleCode) {
                                ngModelCtrl.$setTouched();
                                scope.refreshCaptcha().then(function () {
                                    ngModelCtrl.$setValidity(validationRuleCode, false);
                                });
                            }
                        }
                    }
                });
    }]);