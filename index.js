(function () { "use strict";

const JsApi = client.JsApi;
const mainUrl = '/plugins/octoSubs';

if (!window.SubtitlesOctopus) {
  const url = `${mainUrl}/subtitles-octopus.js`;
  JsApi.addScriptToHead(url, init);
}
function init() {
  let instance;
  JsApi.notifyOnVideoRemove(item => {
    if (instance) {
      instance.dispose();
      instance = null;
    }
  });
  JsApi.notifyOnVideoChange(item => {
    if (instance) {
      instance.dispose();
      instance = null;
    }
    if (item.duration < 60 * 5) return;
    if (item.url.indexOf('.mp4') == -1) return;
    const subsUrl = item.url.replace('.mp4', '.ass');
    // const subsUrl = `${mainUrl}/test.ass`;
    fetchStatus(subsUrl, status => {
      if (status != 200) return;
      const options = {
        video: document.getElementById('videoplayer'),
        subUrl: subsUrl,
        workerUrl: `${mainUrl}/subtitles-octopus-worker.js`,
        legacyWorkerUrl: `${mainUrl}/subtitles-octopus-worker-legacy.js`
      };
      instance = new SubtitlesOctopus(options);
    });
  });
}

function fetchStatus(address, callback) {
  const client = new XMLHttpRequest();
  client.onload = function() {
    callback(this.status);
  }
  client.open("HEAD", address, true);
  client.send();
}

})();
