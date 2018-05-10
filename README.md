# `hyper-cursorfade`
> Adds an opacity fade-in/fade-out animation to the cursor blink.

This plugin is a complete hack and very ugly so I won't publish to NPM. It animates the opacity on `canvas.xterm-cursor-layer` which makes the cursor appear to fade in and fade out instead of blink, without affecting anything else xTerm renders. Ideally, any terminal animation should be done inside of [`xTerm`](https://github.com/xtermjs/xterm.js/), not a hyper plugin.

## Usage
Since this isn't on NPM, you have to clone the repo and add it inside of `.hyper_plugins/local/`. Then add it to the list of `localPlugins`.

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
  localPlugins: [
    // ...
    'hyper-cursorfade'
  ]
};
```

- The `cursorBlink` option is automatically set to true.
- No CSS is required but it is possible to e.g. adjust the transition ease.
- It looks like the blink interval delay is set to `600ms` and not adjustable.
https://github.com/xtermjs/xterm.js/blob/master/src/renderer/CursorRenderLayer.ts#L22
