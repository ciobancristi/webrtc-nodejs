'use strict';

const AWS = require('aws-sdk'),
    s3 = new AWS.S3(),
    s3Stream = require('s3-upload-stream')(s3),
    zlib = require('zlib'),
    fs = require('fs'),
    path = require('path')

const bucket = 'web-rtc-license-video-storage'

var s3uploadService = {};

s3uploadService.uploadFile = (directory, fileName, callback) => {
    let filePath = path.join(directory, fileName);
    var read = fs.createReadStream(filePath);
    var compress = zlib.createGzip();
    var upload = s3Stream.upload({
        "Bucket": bucket,
        "Key": fileName
    });

    upload.on('error', function (error) {
        console.log('s3 upload error ', error);
    });

    upload.on('part', function (details) {
        console.log('s3 upload part ', details);
    });

    upload.on('uploaded', function (details) {
        console.log('s3 uploaded ', details);
    });

    // Pipe the incoming filestream through compression, and up to S3.
    read.pipe(compress).pipe(upload);

    return callback;
}

s3uploadService.getAllFileNames = () => {
    s3.listObjects({ Bucket: bucket }, (err, data) => {
        var keys = data.Contents.map((val) => { return val.Key });
        return keys;
    });
}

module.exports = s3uploadService;