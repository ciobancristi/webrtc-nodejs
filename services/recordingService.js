'use strict';

const s3uploadService = require('./../services/s3uploadService');

var recordingService = {};

var stripSpecialCharacters = (value) => {
    return value.replace(/\.|\-/g, '');
}

var mapRecordingViewModels = (request, videos) => {
    return videos.map((value) => {
        let title = recordingService.stripFileExtension(value);
        let id = stripSpecialCharacters(title)
        let url = request.protocol + '://' + request.get('host') +
            request.originalUrl + '/' + id;
        return {
            title: title,
            id: id,
            url: url,
            fileName: value
        };
    })
}

recordingService.stripFileExtension = (value) => {
    return value.replace('.webm', '');
}

recordingService.getRecordingViewModels = (request, callback) => {
    s3uploadService.getAllFileNames((videos) => {
        let viewModels = mapRecordingViewModels(request, videos);
        return callback(viewModels);
    })
}

recordingService.getFileName = (fileId) => {
    let day = fileId.substring(0, 2);
    let month = fileId.substring(2, 4);
    let year = fileId.substring(4, 8);
    let hour = fileId.substring(8, 10);
    let minutes = fileId.substring(10, 12);
    let seconds = fileId.substring(12, 14);

    return day + '.' + month + '.' + year + '-' +
        hour + '.' + minutes + '.' + seconds + '.webm';
}

module.exports = recordingService;