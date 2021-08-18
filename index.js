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
    this.api.addSubtitleSupport('ass');
    let instance;
    this.api.notifyOnVideoRemove(item => {
      if (instance) {
        instance.dispose();
        instance = null;
      }
    });
    this.api.notifyOnVideoChange(item => {
      if (instance) {
        this.removeToggleButton();
        instance.dispose();
        instance = null;
      }
      let subsUrl = item.subs;
      if (subsUrl == null || subsUrl == '') {
        if (item.duration < 60 * 5) return;
        if (item.url.indexOf('.mp4') == -1) return;
        subsUrl = item.url.replace('.mp4', '.ass');
      }
      if (subsUrl.indexOf('.ass') == -1) return;
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
        this.addToggleButton();
      });
    });
  }

  fetchStatus(address, callback) {
    const client = new XMLHttpRequest();
    client.onload = function () {
      callback(this.status);
    }
    client.open('HEAD', address, true);
    client.send();
  }

  addToggleButton() {
    const togglesubs = document.querySelector('#togglesubs');
    if (togglesubs) return;
    const button = this.nodeFromString(`
      <button id="togglesubs" title="Toggle subtitles">
       <ion-icon name="text"></ion-icon>
      </button>
    `);
    button.onclick = () => {
      const subsEl = document.querySelector('.libassjs-canvas-parent');
      if (!subsEl) return;
      if (subsEl.style.display == '') {
        subsEl.style.display = 'none';
        button.style.opacity = 0.5;
      } else {
        subsEl.style.display = '';
        button.style.opacity = 1;
      }
    }
    const togglesynch = document.querySelector('#togglesynch');
    togglesynch.parentElement.insertBefore(button, togglesynch);
  }

  removeToggleButton() {
    const togglesubs = document.querySelector('#togglesubs');
    if (!togglesubs) return;
    togglesubs.remove();
  }

  apiPolyfill() {
    let api = this.api;
    let host = location.hostname;
    if (host === '') host = 'localhost';
    if (!api.addSubtitleSupport) api.addSubtitleSupport = () => { };
    if (!api.getLocalIp) api.getLocalIp = () => host;
    if (!api.getGlobalIp) api.getGlobalIp = () => host;
  }

  nodeFromString(div) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = div;
    return wrapper.firstElementChild;
  }

}
