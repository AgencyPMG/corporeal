requirejs.config({
    //By default load any module IDs from js
    baseUrl: window.baseUrl + '/scripts',
    paths: {
        component: window.baseUrl + '/components',
        async: window.baseUrl + '/components/requirejs-plugins/src/async',
        jquery: window.baseUrl + '/components/jquery/dist/jquery.min',
        foundation: window.baseUrl + '/components/foundation/js/foundation.min',
        underscore: window.baseUrl + '/components/underscore/underscore',
        text: window.baseUrl + '/components/requirejs-text/text',
        tinymce: window.baseUrl + '/components/tinymce/tinymce.min'
    },
    shim: {
         foundation: ['jquery'],
         underscore:{
             exports:'_'
         },
    }
});

// Start the main app logic.
requirejs(['jquery', 'underscore', 'foundation'], function($, _, foundation) {
    $(document).foundation();
});
