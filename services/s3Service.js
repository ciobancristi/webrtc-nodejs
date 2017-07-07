'use strict';

const AWS = require('aws-sdk'),
    s3 = new AWS.S3(),
    s3Stream = require('s3-upload-stream')(s3),
    zlib = require('zlib'),
    fs = require('fs'),
    path = require('path')

const bucketName = process.env.S3_BUCKET;

let log = console.log.bind(console);

var s3uploadService = {};

s3Service.uploadFile = (directory, fileName) => {
    let filePath = path.join(directory, fileName);
    log(`s3 upload of ${fileName} started`);
    fs.readFile(filePath, function (err, data) {
        if (err) { throw err; }

        s3.upload({
            Bucket: bucketName,
            Key: fileName,
            Body: data,
            ACL: 'public-read'
        }, function (res) {
            console.log(`s3 successfully uploaded file ${fileName}`);
        })

    });
}

s3Service.getAllFileNames = (callback) => {
    s3.listObjects({ Bucket: bucketName }, (err, data) => {
        var keys = data.Contents.map((val) => {
            return val.Key
        });

        return callback(keys);
    });
}

module.exports = s3Service;