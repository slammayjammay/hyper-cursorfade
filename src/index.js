import hackCursorRenderer from './hack-cursor-renderer';

// https://github.com/xtermjs/xterm.js/blob/master/src/renderer/CursorRenderLayer.ts#L22
const BLINK_INTERVAL = 600;

exports.decorateTerm = (Term, { React }) => {
	return class extends React.Component {
		constructor(...args) {
			super(...args);
			this._onDecorated = this._onDecorated.bind(this);

			this.cursorRenderLayer = null; // xterm internal class
			this.isVisible = true; // is the cursor visible?
		}

		/**
		 * In order for this plugin to work, we need to modify the existing codebase
		 * for XTerm -- specifically, the CursorRenderLayer and its blink state
		 * manager.
		 * https://github.com/xtermjs/xterm.js/blob/master/src/renderer/CursorRenderLayer.ts
		 *
		 * The blink state manager is only initialized inside an `onOptionsChanged`
		 * callback, so we need to wait until that is fired before we make any
		 * modifications.
		 */
		_onDecorated(term) {
			if (this.props.onDecorated) {
				this.props.onDecorated(term);
			}

			if (!term) {
				return;
			}

			this.cursorRenderLayer = term.term.renderer._renderLayers[3];

			// modify the CursorRenderLayer's `_render`. This is moved to its own
			// file (as opposed to changing it here like `_wrapOnOptionsChanged`)
			// because we don't add any functionality specific to this plugin. We're
			// actually only commenting out an `if` statement.
			hackCursorRenderer(this.cursorRenderLayer);

			this._wrapOnOptionsChanged();
		}

		/**
		 * Once the blink state manager is initialized, modify it its methods.
		 */
		_wrapOnOptionsChanged() {
			const that = this;
			const oldFn = this.cursorRenderLayer.__proto__.onOptionsChanged;

			this.cursorRenderLayer.__proto__.onOptionsChanged = function() {
				const blinkStateManager = that.cursorRenderLayer._cursorBlinkStateManager;
				oldFn.apply(this, arguments);
				const newBlinkStateManager = that.cursorRenderLayer._cursorBlinkStateManager;

				if (blinkStateManager !== newBlinkStateManager) {
					that._hack();
				}
			};
		}

		_hack() {
			this._wrapRestartFunction();
			this._wrapRenderFunction();
		}

		/**
		 * Once the old `_render` function has been called, check to see if the
		 * cursor visibility has changed since the last render, and if so update
		 * the canvas's classlist.
		 *
		 * Note: the "old" render has already been modified by
		 * './hack-cursor-renderer.js'.
		 */
		_wrapRenderFunction() {
			const that = this;

			const oldFn = this.cursorRenderLayer._render;

			this.cursorRenderLayer._render = function() {
				oldFn.apply(this, arguments);

				const { isCursorVisible } = this._cursorBlinkStateManager;

				if (isCursorVisible !== that.isVisible) {
					that._toggleVisibility(isCursorVisible);
				}
			};
		}

		/**
		 * When typing or holding down a key, XTerm sets the cursor as visible until
		 * you stop. In the case that the cursor opacity is 0 and a key is pressed,
		 * it looks better when it blinks to full opacity as opposed to animating.
		 */
		_wrapRestartFunction() {
			const that = this;
			const old = this.cursorRenderLayer._cursorBlinkStateManager.restartBlinkAnimation;

			this.cursorRenderLayer._cursorBlinkStateManager.restartBlinkAnimation = function() {
				old.apply(this, arguments);

				that.cursorRenderLayer._canvas.classList.add('immediate-transition');
				requestAnimationFrame(() => {
					that.cursorRenderLayer._canvas.classList.remove('immediate-transition');
				});
			};
		}

		_toggleVisibility(isCursorVisible) {
			this.isVisible = isCursorVisible;

			this.cursorRenderLayer._canvas.classList[
				this.isVisible ? 'remove' : 'add'
			]('fade-out');
		}

		render() {
			return React.createElement(Term, Object.assign({}, this.props, {
				onDecorated: this._onDecorated
			}));
		}
	};
};

// css
exports.decorateConfig = (config) => {
	return Object.assign({}, config, {
		css: `
		.xterm-cursor-layer {
			opacity: 1;
			transition: opacity ${BLINK_INTERVAL}ms;
		}

		.xterm-cursor-layer.fade-out {
			opacity: 0;
		}

		.xterm-cursor-layer.immediate-transition {
			transition-duration: 0ms;
		}

		${config.css || ''}
		`
	});
};
