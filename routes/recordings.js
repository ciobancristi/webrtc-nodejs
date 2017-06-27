const express = require('express');
const passport = require('passport');
const router = express.Router();
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const s3uploadService = require('./../services/s3uploadService');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

var env = {
    S3_BUCKET_URL: process.env.S3_BUCKET_URL,
    MONGODB: process.env.MONGODB
};

let log = console.log.bind(console);
let uploadsFolderPath = path.join(__dirname, '../uploads/');

router.get('/', ensureLoggedIn, (req, res) => {
    getRecordingViewModels(req, (viewModels) => {
        res.render('recordings', { videos: viewModels, userName: req.user.name });
    });
})

router.get('/:id', ensureLoggedIn, (req, res) => {
    let recordingId = req.params["id"];
    let fileName = getFileName(recordingId);
    let url = env.S3_BUCKET_URL + fileName;
    res.render('recording', { url: url, userName: req.user.name })
})

//////////////// util ///////////////
var stripFileExtension = (value) => {
    return value.replace('.webm', '');
}

var stripSpecialCharacters = (value) => {
    return value.replace(/\.|\-/g, '');
}

var getRecordingViewModels = (request, callback) => {
    s3uploadService.getAllFileNames((videos) => {
        var viewModels = mapRecordingViewModels(request, videos);
        return callback(viewModels);
    })
}

var mapRecordingViewModels = (request, videos) => {
    return videos.map((value) => {
        var title = stripFileExtension(value);
        var id = stripSpecialCharacters(title)
        var url = request.protocol + '://' + request.get('host') +
            request.originalUrl + '/' + id;
        return {
            title: title,
            id: id,
            url: url,
            fileName: value
        };
    })
}

var getFileName = (fileId) => {
    let day = fileId.substring(0, 2);
    let month = fileId.substring(2, 4);
    let year = fileId.substring(4, 8);
    let hour = fileId.substring(8, 10);
    let minutes = fileId.substring(10, 12);
    let seconds = fileId.substring(12, 14);

    return day + '.' + month + '.' + year + '-' +
        hour + '.' + minutes + '.' + seconds + '.webm';
}

module.exports = router;