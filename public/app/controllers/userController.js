angular.module('userController', ['userService'])
    .controller('userController', function (User) {
        var vm = this;
        // set a processing variable to show loading things
        vm.processing = true;
        // grab all users at page load
        User.all()
            .success(function (data) {
                vm.processing = false;
                vm.users = data;
            });
        // function to delete user
        vm.deleteUser = function (id) {
            vm.processing = true;
            User.delete(id)
                .success(function (data) {
                    User.all()
                        .success(function (data) {
                            vm.processing = false;
                            vm.users = data;
                        });
                });
        };
    }).controller('userCreateController', function (User) {
        var vm = this;
        vm.type = 'create';
        // function to save the new user
        vm.saveUser = function () {
            vm.processing = true;
            // clear message 
            vm.message = '';
            User.create(vm.userData)
                .success(function (data) {
                    vm.processing = false;
                    // clear form
                    vm.userData = {};
                    vm.message = data.message;
                });
        };
    }).controller('userEditController', function ($routeParams, User) {
        var vm = this;
        vm.type = 'edit';
        //get the user data from the user we want to edit
        User.get($routeParams.user_id)
            .success(function (data) {
                vm.userData = data;
            });
        // function to save the new user data
        vm.saveUser = function () {
            vm.processing = true;
            // clear message 
            vm.message = '';
            User.update($routeParams.user_id, vm.userData)
                .success(function (data) {
                    vm.processing = false;
                    // clear form
                    vm.userData = {};
                    vm.message = data.message;
                });
        };
    });
