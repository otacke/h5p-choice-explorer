import Util from '@services/util.js';

export default class InputField {

  /**
   * @class InputField
   * @param {object} params Parameters.
   * @param {number} [params.min] Minimum value for input.
   * @param {number} [params.max] Maximum value for input.
   * @param {object} callbacks Callbacks.
   * @param {function} [callbacks.onInput] Callback when input changed.
   * @param {function} [callbacks.onBlur] Callback when input blurred.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = Util.extend({
      min: 0
    }, params);

    this.callbacks = Util.extend({
      onInput: () => {},
      onBlur: () => {}
    }, callbacks);

    this.dom = document.createElement('input');
    this.dom.classList.add('slider-panel-input');
    this.dom.setAttribute('type', 'number');
    this.dom.setAttribute('min', `${params.min}`);
    if (params.max) {
      this.dom.setAttribute('max', `${params.max}`);
    }
    this.dom.value = Math.max(params.min, Math.min(0, params.max));

    this.dom.addEventListener('input', () => {
      this.handleInput();
    });

    this.dom.addEventListener('blur', () => {
      this.handleBlur();
    });
  }

  /**
   * Get DOM.
   * @returns {HTMLElement} DOM.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Set value.
   * @param {number} value Value to set.
   */
  setValue(value) {
    if (typeof value !== 'number' || isNaN(value) || value < this.params.min || value > this.params.max) {
      return;
    }

    this.dom.value = value;
  }

  /**
   * Get value.
   * @returns {number} Value.
   */
  getValue() {
    return parseFloat(this.dom.value);
  }

  /**
   * Handle user input.
   */
  handleInput() {
    const value = parseFloat(this.dom.value);
    if (typeof value !== 'number' || isNaN(value) || value < this.params.min) {
      return;
    }

    this.callbacks.onInput(value);
  }

  /**
   * Handle blur.
   */
  handleBlur() {
    this.callbacks.onBlur();
  }
}
