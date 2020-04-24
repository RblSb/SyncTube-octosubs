## SyncTube-octoSubs

[SyncTube](https://github.com/RblSb/SyncTube) subtitles plugin based on [Octopus](https://github.com/Dador/JavascriptSubtitlesOctopus) (experimental)

### Installation
- Install and open SyncTube project folder
- Create `user/res/js/custom.js` file:
```js
'use strict';
const JsApi = client.JsApi;
JsApi.addPlugin('octoSubs');
```
- Create `user/res/plugins/` folder
- Open `plugins` folder in terminal: `cd user/res/plugins`
- `git clone https://github.com/RblSb/SyncTube-octoSubs.git octoSubs`

Now every time you add `site.com/file.mp4` to playlist this plugin will check `site.com/file.ass` file and load if it exists. To load `ass` file [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) should be enabled on that server.

Url input / more features soon.
