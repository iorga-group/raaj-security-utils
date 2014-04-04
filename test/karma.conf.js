module.exports = function(config){
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath : '../',

        // list of files / patterns to load in the browser
        files : [
          'node_modules/mocha/mocha.js',
          'node_modules/should/should.js',
          'bower_components/cryptojslib/rollups/md5.js',
          'bower_components/cryptojslib/rollups/hmac-sha1.js',
          'bower_components/cryptojslib/components/enc-base64.js',
          'src/raaj-security-utils.js',
          'test/unit/**/*.js'
        ],

        // list of files to exclude
        exclude : [],

        frameworks: ['mocha'],

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters : ['progress'],


        // enable / disable colors in the output (reporters and logs)
        colors : true,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch : false,

        browsers : ['PhantomJS'],

        singleRun : true
    });
};