'use strict';

var _ = require('lodash');
var gulp = require('gulp');
var clean = require('gulp-clean');

gulp.task('copy-assets', function () {
    var assets = {
        js: [
            './node_modules/bootstrap/dist/js/bootstrap.min.js',
            './node_modules/jquery/dist/jquery.min.js',
            './node_modules/rtcmulticonnection-v3/dist/RTCMultiConnection.js',
            './node_modules/recordrtc/RecordRTC.min.js'
        ],
        css: ['./node_modules/bootstrap/dist/css/bootstrap.min.css',
            './node_modules/font-awesome/css/font-awesome.min.css'
        ]
    };
    _(assets).forEach(function (assets, type) {
        gulp.src(assets).pipe(gulp.dest('./public/' + type));
    });
});

gulp.task('clean-uploads', function () {
    return gulp.src('uploads/*.webm', { read: false })
        .pipe(clean());
});