'use strict';

const express = require('express');
const passport = require('passport');
const router = express.Router();
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const recordingService = require('./../services/recordingService');

router.get('/', ensureLoggedIn, (req, res) => {
    recordingService.getRecordingViewModels(req, (viewModels) => {
        res.render('recordings', { videos: viewModels, userName: req.user.name });
    });
})

router.get('/:id', ensureLoggedIn, (req, res) => {
    let recordingId = req.params["id"];
    let fileName = recordingService.getFileName(recordingId);
    let url = process.env.S3_BUCKET_URL + fileName;
    let recordingName = recordingService.stripFileExtension(fileName);

    res.render('recording', {
        url: url,
        recordingName: recordingName,
        userName: req.user.name
    })
})

module.exports = router;