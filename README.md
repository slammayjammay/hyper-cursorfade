# `hyper-cursorfade`
> Adds an opacity fade-in/fade-out animation to the cursor blink.

This plugin is a complete hack and very ugly so I won't publish to NPM. It animates the opacity on `canvas.xterm-cursor-layer` which makes it appear that the cursor fades in and fades out instead of blinking, without affecting anything else xTerm renders. Ideally, any animation should be done via the canvas context and not on the canvas element itself.

## Usage
All you have to do is add this repo path to the list of plugins. No CSS is required but it is possible to e.g. adjust the transition ease.

It looks like the blink interval delay is set to `600ms` and not adjustable.
https://github.com/xtermjs/xterm.js/blob/master/src/renderer/CursorRenderLayer.ts#L22

```js
/* .hyper.js */

module.exports = {
  config: {
    // ...
    css: `
    /* ... */

    .xterm-cursor-layer {
      transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
    }
    `
  },
  plugins: [
    // ...
    'https://github.com/slammayjammay/hyper-cursorfade'
  ]
};
```
