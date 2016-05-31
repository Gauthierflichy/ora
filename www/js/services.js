angular.module('starter.services', [])

.factory('DBconnect', function () {

    var myExercices = [];

    var db = {

        getName: function (authData) {
            switch(authData.provider) {
                case 'password':
                    name =  authData.password.email.replace(/@.*/, '');
                    return name;
                case 'twitter':
                    name =  authData.twitter.displayName;
                    return name;
                case 'facebook':
                    name =  authData.facebook.displayName;
                    return name;
            }

        },


        /*    deleteExo: function (ex, ref, name) {
         ref.child("exercices/"+ name+"/"+ex.id).remove();


         ref.child("exercices/"+ name).on("child_removed", function(snapshot) {
         var deletedPost = snapshot.val();
         console.log("The blog post titled '" + deletedPost + "' has been deleted");
         });
         },*/

        validateExo: function (ex, ref, name) {
            ref.child("exercices/"+ name+"/"+ex.id).remove();


            ref.child("exercices/"+ name).on("child_removed", function(snapshot) {
                var deletedPost = snapshot.val();
                console.log("Exo validé");
            });
        },

        addExo : function (e, ref, name) {

            var newPush = ref.child("exercices/"+ name).push({
                name: e.name.name,
                date: e.newDate.toJSON(),
                series: e.series,
                repetition: e.repetitions,
                frequence: e.frequence
            });

            var exoID = newPush.key();

            ref.child("exercices/"+name+"/"+exoID).update({
                id:  exoID
            });

            console.log(exoID);

            /*ref.child("exercices/"+ name).on("child_added", function(snapshot) {
             var addedPost = snapshot.val().name;
             console.log("The blog post titled '" + addedPost + "' has been added");
             });*/
        }

    };

    return db;

});