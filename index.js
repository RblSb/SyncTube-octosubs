synctube.octosubs = class {

  constructor(obj) {
    this.api = obj.api;
    this.path = obj.path;
    this.api.addSubtitleSupport('ass');
    if (!window.ASS) {
      const url = `${this.path}/ass.global.min.js`;
      this.api.addScriptToHead(url, () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    this.instance = null;
    this.container = null;

    this.api.notifyOnVideoRemove(this.onVideoRemove.bind(this));
    this.api.notifyOnVideoChange(this.onVideoChange.bind(this));

    const videoItems = this.api.getVideoItems();
    if (videoItems.length > 0) this.onVideoChange(videoItems[0]);
  }

  onVideoRemove(item) {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  onVideoChange(item) {
    if (this.instance) {
      this.removeToggleButton();
      this.instance.destroy();
      this.instance = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
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
      subsUrl = `/proxy?url=${encodeURIComponent(subsUrl)}`;
    }

    this.fetchStatus(subsUrl, status => {
      if (status != 200) return;

      // Create subtitle container
      this.container = this.createSubtitleContainer();

      // Fetch and initialize ASS.js
      this.fetchAssContent(subsUrl, content => {
        if (!content) return;

        const video = document.getElementById('videoplayer');
        if (!video) return;

        try {
          this.instance = new window.ASS(content, video, {
            container: this.container,
            resampling: 'video_width'
          });

          this.addToggleButton();
        } catch (error) {
          console.error('Failed to initialize ASS.js:', error);
        }
      });
    });
  }

  createSubtitleContainer() {
    const existing = document.querySelector('#ass-subtitle-container');
    if (existing) existing.remove();

    const video = document.getElementById('videoplayer');
    if (!video) return null;

    const container = document.createElement('div');
    container.id = 'ass-subtitle-container';
    container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      color-scheme: light only;
    `;

    // Find the video's parent container
    const videoParent = video.parentElement;
    if (videoParent) {
      // Ensure video parent has relative positioning
      const computedStyle = window.getComputedStyle(videoParent);
      if (computedStyle.position === 'static') {
        videoParent.style.position = 'relative';
      }
      videoParent.appendChild(container);
    }

    return container;
  }

  fetchAssContent(url, callback) {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.text();
      })
      .then(content => callback(content))
      .catch(error => {
        console.error('Failed to fetch ASS content:', error);
        callback(null);
      });
  }

  fetchStatus(address, callback) {
    const client = new XMLHttpRequest();
    client.onload = function () {
      callback(this.status);
    }
    client.onerror = function() {
      callback(0);
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
      const subsEl = document.querySelector('#ass-subtitle-container');
      if (!subsEl) return;

      if (subsEl.style.display === 'none') {
        subsEl.style.display = '';
        button.style.opacity = '1';
        if (this.instance) this.instance.show();
      } else {
        subsEl.style.display = 'none';
        button.style.opacity = '0.5';
        if (this.instance) this.instance.hide();
      }
    }

    const togglesynch = document.querySelector('#togglesynch');
    if (togglesynch && togglesynch.parentElement) {
      togglesynch.parentElement.insertBefore(button, togglesynch);
    }
  }

  removeToggleButton() {
    const togglesubs = document.querySelector('#togglesubs');
    if (!togglesubs) return;
    togglesubs.remove();
  }

  nodeFromString(div) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = div;
    return wrapper.firstElementChild;
  }

}
