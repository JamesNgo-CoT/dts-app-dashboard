/*
 The gulpfile for WCM-embedded WRP web apps using the core library combined with bower and gulp.
 You shouldn't have to change this file much, but you could if you wanted.
 Note that this file uses es6 syntax.
 http://gulpjs.com/
 */

const gulp = require('gulp');
const core = require('./bower_components/core/gulp_helper');
const pkg = require('./package.json');

//You should pass options to the createTasks method below
let options = {
  pkg, //pass in the contents of package.json

  //How this app should be embedded in the simulator. Options are: 'full', 'left', or 'right'
  //This is optional, and the default value is 'full'
  //This only applies to apps where isEmbedded is true
  embedArea: 'full',

  //If you want to add vars to the preprocessor context, include this option
  //You can add environment-specific vars or general vars
  preprocessorContext: {
    local: {
      C3API_URL_BASE: 'https://was-intra-sit.toronto.ca',
      LOGIN_CCROOT: 'https://was-intra-qa.toronto.ca',
      SOME_ENV: 'SOME_ENV will have this value in the local build environment'
    },
    dev: {
      C3API_URL_BASE: '',
      LOGIN_CCROOT: 'https://was-intra-qa.toronto.ca',
      SOME_ENV: 'SOME_ENV will have this value in the dev build environment'
    },
    qa: {
      C3API_URL_BASE: '',
      LOGIN_CCROOT: '',
      SOME_ENV: 'SOME_ENV will have this value in the qa build environment'
    },
    prod: {
      C3API_URL_BASE: '',
      LOGIN_CCROOT: '',
      SOME_ENV: 'SOME_ENV will have this value in the prod build environment'
    },
    SOME_OTHER_ENV: 'this var will be in the context of any environment'
  },

  //If you want to override the environment that the build process uses, specify it here
  //Valid values are: 'local', 'dev', 'qa', 'prod'
  //If you omit this (which you probably should), then the environment will be:
  //'local' when running or building on your machine
  //'dev' when calling gulp deploy:dev
  //'qa' when calling gulp deploy:qa
  //'prod' when calling gulp deploy:prod
  environmentOverride: null,

  //By default, standalone apps are built to deploy to /webapps/appname
  //BUT you can use this option to override that value. ex: /webapps/work/decom/appname
  //IMPORTANT!! this value should NOT end with a forward slash
  //This option has no effect on embedded apps, which are always deployed to /resources/app_name
  //The value used here will also be used for the SRC_PATH preprocessor var
  deploymentPath: null
};

//This creates several gulp tasks to use during development:
//default, clean, build, build_with_simulator, run, deploy:dev, deploy:qa, deploy:prod
core.embeddedApp.createTasks(gulp, options);


//Note that you can override any task that createTasks added, by redefining it after the call to createTasks
//ex:
// gulp.task('deploy:dev', ['_deploy_prep'], () => {
//   ...do some custom deploy code...
// });

//FAKING DATA AND CONFIG FILES:
//Some apps will load data and configurations from 'data' files, usually JSON.
//The location of these files in Dev, QA, and Prod may vary:
//- Could be in the S3 data bucket
//- Could be in a custom Wordpress post
//To 'fake' this when running your app locally, do the following:
// 1. Put some sample data/config files into /src/data folder in the project
// 2. Overwrite the _data gulp task here to copy your data files into a file path that mimics the one on your web server:
// gulp.task('_data', () => {
//   let myDataPath = '/data'; //On S3, this will be something like /data/division/my_app
//                             //On WP, this will be something different
//   return gulp.src(['src/data/**/*']).pipe(gulp.dest('dist' + myDataPath));
// });
