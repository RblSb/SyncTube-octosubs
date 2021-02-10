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
    this.apiPolyfill();
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
      const localIp = this.api.getLocalIp();
      const globalIp = this.api.getGlobalIp();
      // do not need proxy for same server urls
      if (item.url.indexOf(globalIp) != -1) {
        // looks like we are server and connected from localhost
        // use local ip instead of our external ip then
        if (localIp != globalIp) subsUrl = subsUrl.replace(globalIp, localIp);
      } else {
        subsUrl = `/proxy?url=${encodeURI(subsUrl)}`;
      }
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
    client.open('HEAD', address, true);
    client.send();
  }

  apiPolyfill() {
    let host = location.hostname;
    if (host === '') host = 'localhost';
    if (!this.api.getLocalIp) this.api.getLocalIp = () => host;
    if (!this.api.getGlobalIp) this.api.getGlobalIp = () => host;
  }

}
