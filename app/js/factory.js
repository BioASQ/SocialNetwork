BioASQ.factory('modalFactory', function($dialog) {

    var data = '',
        cacheData = '';

    return {
        /**
         *
         */
        options: function(templateUrl, ctrl, p_data) {
            data = p_data;
            return {
                backdrop: true,
                keyboard: false,
                backdropClick: false,
                dialogFade: true,
                backdropFade: true,
                templateUrl: templateUrl,
                controller: ctrl
            };
        },
        /**
         *
         */
        setData: function(p_data) {
            data = p_data;
        },
        /**
         *
         */
        getData: function() {
            return data;
        },
        /**
         *
         */
        setCacheData: function(p_cacheData) {
            cacheData = p_cacheData;
        },
        /**
         *
         */
        getCacheData: function() {
            return cacheData;
        },
        /**
         *
         */
        openDialog: function(opts, callback) {
            $dialog.dialog(opts).open().then(function() {
                callback();
            });
        }
    };
});
