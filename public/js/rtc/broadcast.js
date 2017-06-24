var enableRecordings = true;

var connection = new RTCMultiConnection(null, {
    useDefaultDevices: true
});

connection.enableScalableBroadcast = true;
// TODO: see if it is relevant
connection.maxRelayLimitPerUser = 1;
connection.autoCloseEntireSession = true;
connection.socketURL = '/';

connection.connectSocket(function (socket) {
    socket.on('logs', function (msg) { console.log('socket msg: ' + msg) })
    // this event is emitted when a broadcast is already created.
    socket.on('join-broadcaster', function (hintsToJoinBroadcast) {
        console.log('join-broadcaster', hintsToJoinBroadcast);

        connection.session = hintsToJoinBroadcast.typeOfStreams;
        connection.sdpConstraints.mandatory = {
            OfferToReceiveVideo: !!connection.session.video,
            OfferToReceiveAudio: !!connection.session.audio
        };
        connection.broadcastId = hintsToJoinBroadcast.broadcastId;
        connection.join(hintsToJoinBroadcast.userid);
    });

    socket.on('broadcast-stopped', function (broadcastId) {
        alert('Broadcast has been stopped.');
        location.reload();
        console.error('broadcast-stopped', broadcastId);
    });

    socket.on('rejoin-broadcast', function (broadcastId) {
        console.log('rejoin-broadcast', broadcastId);

        connection.attachStreams = [];
        socket.emit('check-broadcast-presence', broadcastId, function (isBroadcastExists) {
            if (!isBroadcastExists) {
                // the first person (i.e. real-broadcaster) MUST set his user-id
                connection.userid = broadcastId;
            }

            socket.emit('join-broadcast', {
                broadcastId: broadcastId,
                userid: connection.userid,
                typeOfStreams: connection.session
            });
        });
    });

    // this event is emitted when a broadcast is absent.
    socket.on('start-broadcasting', function (typeOfStreams) {
        console.log('start-broadcasting', typeOfStreams);

        connection.sdpConstraints.mandatory = {
            OfferToReceiveVideo: false,
            OfferToReceiveAudio: false
        };
        connection.session = typeOfStreams;
        // vital line of code!!!
        connection.open(connection.userid);
    });

});

// where the replay will run
var videoPreview = $('#video-preview').get(0);

connection.onstream = function (event) {
    if (connection.isInitiator && event.type !== 'local') {
        return;
    }
    // // TODO: see if it is relevant
    // if (event.mediaElement) {
    //     event.mediaElement.pause();
    //     delete event.mediaElement;
    // }

    connection.isUpperUserLeft = false;
    videoPreview.src = URL.createObjectURL(event.stream);
    videoPreview.play();

    videoPreview.userid = event.userid;

    if (event.type === 'local') {
        videoPreview.muted = true;
    }

    if (connection.isInitiator == false && event.type === 'remote') {
        // he is merely relaying the media
        connection.dontCaptureUserMedia = true;
        connection.attachStreams = [event.stream];
        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        };

        var socket = connection.getSocket();
        socket.emit('can-relay-broadcast');
    }

    // initialize recorder
    var options = {
        recorderType: MediaStreamRecorder,
        mimeType: 'video/webm\;codecs=vp9'
    };
    connection.currentRecorder = RecordRTC(event.stream, options);
};

document.getElementById('open-or-join').onclick = function () {
    // TODO:  replace with custom userid
    var broadcastId = document.getElementById('broadcast-id').value;

    if (broadcastId.replace(/^\s+|\s+$/g, '').length <= 0) {
        alert('Please enter broadcast-id');
        document.getElementById('broadcast-id').focus();
        return;
    }
    // TODO: remove this
    document.getElementById('open-or-join').disabled = true;

    connection.session = {
        audio: true,
        video: true,
        oneway: true
    };

    addVideoConstrains();

    var socket = connection.getSocket();

    socket.emit('check-broadcast-presence', broadcastId, function (isBroadcastExists) {
        if (!isBroadcastExists) {
            connection.userid = broadcastId;
        }

        console.log('check-broadcast-presence', broadcastId, isBroadcastExists);

        socket.emit('join-broadcast', {
            broadcastId: broadcastId,
            userid: connection.userid,
            typeOfStreams: connection.session
        });
    });
};
// setTimeout(() => {
//     document.getElementById('open-or-join').click();
// }, 2000);

connection.onNumberOfBroadcastViewersUpdated = function (event) {
    if (!connection.isInitiator) return;

    document.getElementById('broadcast-viewers-counter').innerHTML = 'Number of broadcast viewers: <b>' + event.numberOfBroadcastViewers + '</b>';
};

function addVideoConstrains() {
    connection.mediaConstraints = {
        audio: true,
        video: {
            mandatory: {
                minWidth: 400,
                maxWidth: 1280,
                minHeight: 400,
                maxHeight: 720,
                minFrameRate: 15
            },
            optional: []
        }
    };

    if (DetectRTC.browser.name === 'Firefox') {
        connection.mediaConstraints = {
            audio: true,
            video: {
                width: 1280,
                height: 720,
                frameRate: 30
            }
        };
    }
}


// ......................................................
// ......................Recording................
// ......................................................
var btnStartRecording = document.querySelector('#btn-start-recording');
var btnStopRecording = document.querySelector('#btn-stop-recording');
btnStopRecording.disabled = true;

var manualRecording = false;
var isRecording = false;
var recording;

btnStartRecording.onclick = function () {
    if (connection.currentRecorder) {
        console.log('started recording manually');

        if (isRecording && recording) {
            console.log('force stop previous recording');
            clearTimeout(recording);
            stopRecording();
        }

        btnStopRecording.disabled = false;
        btnStartRecording.disabled = true;

        manualRecording = true;
        connection.currentRecorder.startRecording();

        var duration = 3 * 1000 * 60; // three minutes
        recording = setTimeout(() => { stopRecording() }, duration);
    }
};

btnStopRecording.onclick = function () {
    if (manualRecording) {
        manualRecording = false;

        if (recording) {
            console.log('force stop manual recording');
            clearTimeout(recording);
            stopRecording();
        }

        btnStopRecording.disabled = true;
        btnStartRecording.disabled = false;
    }
};

var startRecording = () => {
    if (connection.currentRecorder && !manualRecording && !isRecording) {
        console.log('started recording');
        isRecording = true;
        connection.currentRecorder.startRecording();
        var duration = 1000 * 30; // thirty seconds
        recording = setTimeout(() => { stopRecording() }, duration);
    }
}

var stopRecording = () => {
    isRecording = false;
    connection.currentRecorder.stopRecording(postFiles);
    console.log('stopped recording')
}

var detectMotion = () => {
    MotionDetector.videoElement = videoPreview;
    MotionDetector.Core(startRecording);
}

detectMotion();

// xhr
function postFiles() {
    var blob = connection.currentRecorder.getBlob();

    var fileName = getTimestampFileName() + '.webm';

    var file = new File([blob], fileName, {
        type: 'video/webm'
    });

    xhr('/upload', file, (res) => {
        console.log(res);
    });
}

function xhr(url, data, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState == XMLHttpRequest.DONE && request.status == 200) {
            callback(request.responseText);
        }
    };

    request.open('POST', url);
    var formData = new FormData();
    formData.append('file', data);

    request.send(formData);
}
// end xhr

// recording util
var getTimestampFileName = () => {
    var date = new Date(),
        year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hour = date.getHours(),
        minutes = date.getMinutes(),
        seconds = date.getSeconds();

    return toTwoDigits(day) + '.' + toTwoDigits(month) + '.' + year.toString()
        + '-' + toTwoDigits(hour) + '.' + toTwoDigits(minutes) + '.' + toTwoDigits(seconds);
}

var toTwoDigits = (value) => {
    if (value < 10) value = '0' + value.toString();
    return value.toString();
}
// end recording util

