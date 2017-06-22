'use strict';

const AWS = require('aws-sdk'),
    s3 = new AWS.S3(),
    s3Stream = require('s3-upload-stream')(s3),
    zlib = require('zlib'),
    fs = require('fs'),
    path = require('path')

const bucketName = 'web-rtc-license-video-storage';

let log = console.log.bind(console);

var s3uploadService = {};

s3uploadService.uploadFile = (directory, fileName) => {
    let filePath = path.join(directory, fileName);
    var read = fs.createReadStream(filePath);
    var compress = zlib.createGzip();
    log(`s3 upload of ${fileName} started`);
    var upload = s3Stream.upload({
        Bucket: bucket,
        Key: fileName,
        ACL:'public-read'
    });

    upload.on('error', function (error) {
        log('s3 upload error ', error);
    });

    upload.on('part', function (details) {
        log('s3 upload part ', details);
    });

    upload.on('uploaded', function (details) {
        log('s3 uploaded ', details);
    });

    // Pipe the incoming filestream through compression, and up to S3.
    read.pipe(compress).pipe(upload);
}

s3uploadService.getAllFileNames = (callback) => {
    s3.listObjects({ Bucket: bucketName }, (err, data) => {
        var keys = data.Contents.map((val) => {
            return val.Key
        });

        return callback(keys);
    });
}

module.exports = s3uploadService;