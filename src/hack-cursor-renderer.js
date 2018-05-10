/**
 * https://github.com/xtermjs/xterm.js/blob/master/src/renderer/CursorRenderLayer.ts
 * When the `cursorBlink` option is set to true on XTerm, the cursor is
 * continually drawn and erased from the canvas. Because this plugin has a fade
 * effect, we don't want to erase the cursor.
 *
 * Luckily, it looks like this is pretty easy to comment out.
 */

const CHAR_DATA_WIDTH_INDEX = 2;

export default (cursorRenderLayer) => {
	cursorRenderLayer._render = function(terminal, triggeredByAnimationFrame) {
		// Don't draw the cursor if it's hidden
		if (!terminal.cursorState || terminal.cursorHidden) {
			this._clearCursor();
			return;
		}

		const cursorY = terminal.buffer.ybase + terminal.buffer.y;
		const viewportRelativeCursorY = cursorY - terminal.buffer.ydisp;

		// Don't draw the cursor if it's off-screen
		if (viewportRelativeCursorY < 0 || viewportRelativeCursorY >= terminal.rows) {
			this._clearCursor();
			return;
		}

		const charData = terminal.buffer.lines.get(cursorY)[terminal.buffer.x];
		if (!charData) {
			return;
		}

		if (!terminal.isFocused) {
			this._clearCursor();
			this._ctx.save();
			this._ctx.fillStyle = this._colors.cursor.css;
			this._renderBlurCursor(terminal, terminal.buffer.x, viewportRelativeCursorY, charData);
			this._ctx.restore();
			this._state.x = terminal.buffer.x;
			this._state.y = viewportRelativeCursorY;
			this._state.isFocused = false;
			this._state.style = terminal.options.cursorStyle;
			this._state.width = charData[CHAR_DATA_WIDTH_INDEX];
			return;
		}

		/* MODIFIED CODE */
		// Don't draw the cursor if it's blinking
		// if (this._cursorBlinkStateManager && !this._cursorBlinkStateManager.isCursorVisible) {
		// 	this._clearCursor();
		// 	return;
		// }
		/* MODIFIED CODE */

		if (this._state) {
			// The cursor is already in the correct spot, don't redraw
			if (this._state.x === terminal.buffer.x &&
				this._state.y === viewportRelativeCursorY &&
				this._state.isFocused === terminal.isFocused &&
				this._state.style === terminal.options.cursorStyle &&
				this._state.width === charData[CHAR_DATA_WIDTH_INDEX]) {
				return;
			}
			this._clearCursor();
		}

		this._ctx.save();
		this._cursorRenderers[terminal.options.cursorStyle || 'block'](terminal, terminal.buffer.x, viewportRelativeCursorY, charData);
		this._ctx.restore();

		this._state.x = terminal.buffer.x;
		this._state.y = viewportRelativeCursorY;
		this._state.isFocused = false;
		this._state.style = terminal.options.cursorStyle;
		this._state.width = charData[CHAR_DATA_WIDTH_INDEX];
	}.bind(cursorRenderLayer);
};

