## SyncTube-octosubs

[SyncTube](https://github.com/RblSb/SyncTube) ASS subtitles plugin based on [ASS.js](https://github.com/weizhenye/ASS) (experimental)

**Attention:** SyncTube now has basic ASS support out of box (in web and android clients), that converts ASS text to WebVTT subtitles. Install this if you need more colors, formatting and other ASS features.

### Installation
- Install and open SyncTube project folder
- Create `user/res/js/custom.js` file:
```js
'use strict';
const JsApi = client.JsApi;
JsApi.addPlugin('octosubs');
```
- Create `user/res/plugins/` folder
- Open `plugins` folder in terminal: `cd user/res/plugins`
- `git clone https://github.com/RblSb/SyncTube-octosubs.git octosubs`

Now every time you add `site.com/file.mp4` to playlist this plugin will check `site.com/file.ass` file and load if it exists. Or you can just set actual subtitles url in separate input.
