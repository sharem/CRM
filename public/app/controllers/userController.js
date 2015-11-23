angular.module('userController', ['userService']).controller('userController', function(User) {
    var vm = this;
    // set a processing variable to show loading things
    vm.processing = true;
    // grab all users at page load
    User.all()
        .success(function(data){
            vm.processing =  false;
            vm.users = data;
        });
});