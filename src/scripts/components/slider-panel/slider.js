import Util from '@services/util.js';
import './slider.scss';

export default class Slider {

  /**
   * @class Slider
   * @param {object} params Parameters.
   * @param {number} [params.maxValue] Maximum value for slider.
   * @param {string} [params.ariaLabel] Aria label for slider.
   * @param {object} callbacks Callbacks.
   * @param {function} [callbacks.onStarted] Callback when slider started.
   * @param {function} [callbacks.onSeeked] Callback when slider seeked.
   * @param {function} [callbacks.onEnded] Callback when slider ended.
   * @param {function} [callbacks.onFocus] Callback when slider focused.
   * @param {function} [callbacks.onBlur] Callback when slider blurred.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = Util.extend({
      ariaLabel: 'Slider',
      minValue: 0
    }, params);

    this.callbacks = Util.extend({
      onStarted: () => {},
      onSeeked: () => {},
      onEnded: () => {},
      onFocus: () => {},
      onBlur: () => {}
    }, callbacks);

    this.dom = document.createElement('div');
    this.dom.classList.add('slider-container');

    this.slider = document.createElement('input');
    this.slider.classList.add('slider');
    this.slider.setAttribute('aria-labelledby', this.params.ariaLabelUUID);
    this.slider.setAttribute('type', 'range');
    this.slider.setAttribute('min', `${this.params.minValue}`);
    this.slider.setAttribute('aria-valuemin', `${this.params.minValue}`);
    this.slider.setAttribute('max', `${this.params.maxValue}`);
    this.slider.setAttribute('aria-valuemax', `${this.params.maxValue}`);
    this.slider.setAttribute('step', '1');
    this.slider.setAttribute('aria-label', this.params.ariaLabel);

    ['keydown', 'mousedown', 'touchstart'].forEach((eventType) => {
      this.slider.addEventListener(eventType, (event) => {
        this.handleSliderStarted(event);
      });
    });

    this.slider.addEventListener('input', () => {
      this.handleSliderSeeked(parseFloat(this.slider.value));
    });

    ['keyup', 'mouseup', 'touchend'].forEach((eventType) => {
      this.slider.addEventListener(eventType, (event) => {
        this.handleSliderEnded(parseFloat(this.slider.value));
      });
    });

    this.slider.addEventListener('focus', () => {
      this.callbacks.onFocus();
    });

    this.slider.addEventListener('blur', () => {
      this.callbacks.onBlur();
    });

    this.dom.append(this.slider);

    this.setValue(Math.max(this.params.minValue, 0));
  }

  /**
   * Get slider DOM.
   * @returns {HTMLElement} Slider DOM.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Enable slider.
   */
  enable() {
    this.slider.removeAttribute('disabled');
  }

  /**
   * Disable slider.
   */
  disable() {
    this.slider.setAttribute('disabled', '');
  }

  /**
   * Get value.
   * @returns {number} Value.
   */
  getValue() {
    return parseFloat(this.slider.value);
  }

  /**
   * Set slider to position.
   * @param {number} value Position to set slider to.
   */
  setValue(value) {
    if (typeof value !== 'number' || isNaN(value)) {
      return;
    }

    const percentage = ((value - this.params.minValue) / (this.params.maxValue - this.params.minValue)) * 100;

    this.slider.style.background =
      `linear-gradient(to right, var(--color-primary-dark-80) ${percentage}%, var(--color-primary-15) ${percentage}%)`;

    // Required for Firefox to update slider value reliably when max value changed.
    window.requestAnimationFrame(() => {
      this.slider.value = Math.max(0, Math.min(value, this.params.maxValue));
      this.slider.setAttribute('aria-valuenow', value);
    });
  }

  /**
   * Get maximum value.
   * @returns {number} Maximum value.
   */
  getMaxValue() {
    return this.params.maxValue;
  }

  /**
   * Set maximum value.
   * @param {number} maxValue Maximum value.
   */
  setMaxValue(maxValue) {
    if (typeof maxValue !== 'number' || isNaN(maxValue) || maxValue < this.params.minValue) {
      return;
    }

    this.params.maxValue = maxValue;
    this.slider.setAttribute('max', `${maxValue}`);
    this.slider.setAttribute('aria-valuemax', `${maxValue}`);
  }

  /**
   * Reset.
   */
  reset() {
    this.setValue(this.params.minValue);
  }

  /**
   * Handle keyboard event.
   * @param {KeyboardEvent} event Keyboard event.
   * @returns {boolean} True if key was handled, false otherwise.
   */
  handleKeyboardEvent(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.code)) {
      return false;
    }

    // Speed up slightly when holding down keys (only relevant for left/right keys).
    const delta = Math.max(1, Math.log(this.keydownTime + 1));

    if (event.code === 'ArrowLeft') {
      this.setValue(this.getValue() - delta);
    }
    else if (event.code === 'ArrowRight') {
      this.setValue(this.getValue() + delta);
    }
    else if (event.code === 'Home') {
      this.setValue(0);
    }
    else if (event.code === 'End') {
      this.setValue(this.params.maxValue);
    }

    this.keydownTime ++;

    this.handleSliderSeeked(parseFloat(this.slider.value));
    event.preventDefault();

    return true;
  }

  /**
   * Handle slider started.
   * @param {Event} event Event.
   */
  handleSliderStarted(event) {
    this.isSeeking = true;
    if (event instanceof KeyboardEvent) {
      const wasKeyHandled = this.handleKeyboardEvent(event);
      if (wasKeyHandled) {
        this.callbacks.onStarted();
      }
    }
    else {
      this.callbacks.onStarted();
    }
  }

  /**
   * Handle slider seeked.
   * @param {number} value Value.
   */
  handleSliderSeeked(value) {
    if (!this.isSeeking) {
      return; // Workaround for Firefox, would otherwise trigger 'input event' => sliderSeeked after sliderEnded.
    }

    this.callbacks.onSeeked(value);
    this.setValue(value);
  }

  /**
   * Handle slider ended.
   * @param {number} value Value.
   */
  handleSliderEnded(value) {
    this.isSeeking = false;
    this.keydownTime = 0;
    this.callbacks.onEnded(value);
  }
}
