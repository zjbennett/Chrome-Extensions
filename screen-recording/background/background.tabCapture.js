function captureTabUsingTabCapture(isNoAudio) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(arrayOfTabs) {
        var activeTab = arrayOfTabs[0];
        var activeTabId = activeTab.id; // or do whatever you need

        var constraints = {
            audio: isNoAudio === true ? false : true,
            video: true,
            videoConstraints: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    maxWidth: 3840,
                    maxHeight: 2160
                }
            },
            audioConstraints: isNoAudio === true ? false : {
                mandatory: {
                    echoCancellation: true
                }
            }
        };

        // chrome.tabCapture.onStatusChanged.addListener(function(event) { /* event.status */ });

        chrome.tabCapture.capture(constraints, function(stream) {
            gotTabCaptureStream(stream, constraints);

            // chrome.tabs.update(activeTabId, {active: true});

            try {
                // to fix bug: https://github.com/muaz-khan/RecordRTC/issues/281
                chrome.tabs.executeScript(activeTabId, {
                    code: executeScriptForTabCapture.toString() + ';executeScriptForTabCapture();'
                });
            }
            catch(e) {}
        });
    });
}

function gotTabCaptureStream(stream, constraints) {
    if (!stream) {
        if (constraints.audio === true) {
            captureTabUsingTabCapture(true);
            return;
        }
        chrome.runtime.reload();
        return;
    }

    var newStream = new MediaStream();

    if(enableTabCaptureAPIAudioOnly) {
        stream.getAudioTracks().forEach(function(track) {
            newStream.addTrack(track);
        });
    }
    else {
        stream.getAudioTracks().concat(stream.getVideoTracks()).forEach(function(track) {
            newStream.addTrack(track);
        });
    }

    initVideoPlayer(newStream);

    gotStream(newStream);
}

function executeScriptForTabCapture() {
    var div = document.createElement('img');
    div.style = 'position: fixed;top: 0px;right: 0px;width: 20px;z-index: 2147483647;';
    div.src = 'https://webrtcweb.com/progress.gif';
    (document.body || document.documentElement).appendChild(div);
}
