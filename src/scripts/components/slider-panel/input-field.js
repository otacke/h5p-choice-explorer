import Util from '@services/util.js';
import './input-field.scss';

export default class InputField {

  /**
   * @class InputField
   * @param {object} params Parameters.
   * @param {number} [params.min] Minimum value for input.
   * @param {number} [params.max] Maximum value for input.
   * @param {number} [params.baseMax] Base maximum value for input.
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

    const value = Math.max(params.min, Math.min(0, params.max ?? 0));

    this.dom = document.createElement('input');
    this.dom.classList.add('slider-panel-input');
    this.dom.setAttribute('aria-labelledby', this.params.ariaLabelUUID);
    this.dom.setAttribute('type', 'number');
    this.dom.setAttribute('min', `${params.min}`);
    this.dom.value = value;
    this.dom.setAttribute('aria-valuetext', `${value} ${params.unit}`);
    if (params.max) {
      this.dom.setAttribute('max', `${params.max}`);
    }
    else {
      this.dom.setAttribute('max', `${params.baseMax}`);
    }

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
    this.dom.setAttribute('aria-valuetext', `${value} ${this.params.unit}`);
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
    let value = parseFloat(this.dom.value);

    if (typeof value !== 'number' || isNaN(value) || value < this.params.min) {
      return;
    }

    if (value > parseFloat(this.dom.max)) {
      value = parseFloat(this.dom.max);
    }

    this.dom.setAttribute('aria-valuetext', `${value} ${this.params.unit}`);

    this.callbacks.onInput(value);
  }

  /**
   * Handle blur.
   */
  handleBlur() {
    this.callbacks.onBlur(parseFloat(this.dom.value));
  }

  /**
   * Reset input.
   */
  reset() {
    this.setValue(this.params.min);
  }
}
