'use strict';

const chokidar = require('chokidar');

var videoUploader = {};

videoUploader.watch = () => {
    let watcher = chokidar.watch('uploads', {
        ignored: /(^|[\/\\])\../,
        persistent: true
    });

    let log = console.log.bind(console);

    watcher
        .on('add', path => log(`File ${path} has been added`))

    watcher.unwatch('.gitignore');
}

module.exports = videoUploader;