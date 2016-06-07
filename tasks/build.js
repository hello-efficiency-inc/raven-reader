
const webpack = require('webpack')
const webpackConfig = require('../webpack.config.js')

const gulp = require('gulp')
const gutil = require('gulp-util')
const source = require('vinyl-source-stream')
const path = require('path')
const jetpack = require('fs-jetpack')
const sass = require('gulp-sass');
const minifyCss = require('gulp-minify-css');


const utils = require('./utils')

const src = './app'
const dest = './build'

const projectDir = jetpack
const srcDir = projectDir.cwd(src)
const destDir = projectDir.cwd(dest)

const filesToCopy = [
    './app/app.html',
    './app/fonts/**/*',
    './app/helpers/**/*',
    './app/background.js',
    './app/vendor/**/*',
    './app/node_modules/**/*',
]

// Make a dev copy of the config w/ source maps and debug enabled
const devConfig = Object.create(webpackConfig)
devConfig.devtool = 'source-map'
devConfig.debug = true

gulp.task('clean', function() {
    return jetpack.cwd(dest).dir('.', { empty: true })
})

gulp.task('copy', function() {
    return gulp.src(filesToCopy, { base: 'app' })
        .pipe(gulp.dest(dest))
})

gulp.task('webpack:build-dev', function(callback) {
    return webpack(devConfig, function(err, stats) {
        gutil.log('[webpack:build-dev]', stats.toString({ colors: true }))
        callback()
    })
})

var sassTask = function () {
    return gulp.src('app/stylesheets/main.scss')
    .pipe(sass({
      includePaths: [
        'node_modules/susy/sass'
      ]
    }).on('error', sass.logError))
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(gulp.dest(destDir.path('stylesheets')));
};
gulp.task('sass', ['clean'], sassTask);
gulp.task('sass-watch', sassTask)

gulp.task('finalize', ['clean'], function () {
  const manifest = srcDir.read('package.json', 'json')
  switch (utils.getEnvName()) {
      case 'development':
          // Add 'dev' suffix to name, so Electron will write all
          // data like cookies and localStorage into separate place.
          manifest.name += '-dev'
          manifest.productName += ' Dev'
          break
      case 'test':
          // Add 'test' suffix to name, so Electron will write all
          // data like cookies and localStorage into separate place.
          manifest.name += '-test'
          manifest.productName += ' Test'
          // Change the main entry to spec runner.
          manifest.main = 'spec.js'
          break
  }
  destDir.write('package.json', manifest)

  const configFilePath = projectDir.path('config/env_' + utils.getEnvName() + '.json')
  destDir.copy(configFilePath, 'env_config.json')
})

// Dev builds of assets with source maps and debug enabled
gulp.task('build-dev', ['clean', 'copy', 'webpack:build-dev','sass'])
gulp.task('build', ['build-dev','finalize'])

const filesToWatch = [
  './**/*.coffee',
  './**/*.js',
  './**/*.vue',
  '!./vendor/**',
  '!./node_modules/**',
]

gulp.task('watch', function() {
  // gulp.watch(filesToCopy, ['copy'])  // Commenting this line also fixes the too many files issue.
  gulp.watch('./app/stylesheets/**/*.scss', ['sass-watch'])
  gulp.watch(filesToWatch, { cwd: 'app' }, ['webpack:build-dev'])  // This is watchign too many files and making things very angry.
})
