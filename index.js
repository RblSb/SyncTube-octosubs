synctube.octosubs = class {

  constructor(obj) {
    this.api = obj.api;
    this.path = obj.path;
    if (!window.SubtitlesOctopus) {
      const url = `${this.path}/subtitles-octopus.js`;
      this.api.addScriptToHead(url, () => this.init());
    }
  }

  init() {
    let instance;
    this.api.notifyOnVideoRemove(item => {
      if (instance) {
        instance.dispose();
        instance = null;
      }
    });
    this.api.notifyOnVideoChange(item => {
      if (instance) {
        instance.dispose();
        instance = null;
      }
      if (item.duration < 60 * 5) return;
      if (item.url.indexOf('.mp4') == -1) return;
      let subsUrl = item.url.replace('.mp4', '.ass');
      subsUrl = `/proxy?url=${encodeURI(subsUrl)}`;
      // subsUrl = `${this.path}/test.ass`;
      this.fetchStatus(subsUrl, status => {
        if (status != 200) return;
        const options = {
          video: document.getElementById('videoplayer'),
          subUrl: subsUrl,
          workerUrl: `${this.path}/subtitles-octopus-worker.js`,
          legacyWorkerUrl: `${this.path}/subtitles-octopus-worker-legacy.js`
        };
        instance = new SubtitlesOctopus(options);
      });
    });
  }

  fetchStatus(address, callback) {
    const client = new XMLHttpRequest();
    client.onload = function() {
      callback(this.status);
    }
    client.open("HEAD", address, true);
    client.send();
  }

}
