import Util from '@services/util.js';
import Slider from './slider.js';
import InputField from './input-field.js';
import './slider-panel.scss';

export const FALLBACK_MAX_VALUE = 100;

export default class SliderPanel {

  /**
   * @class SliderPanel
   * @param {object} params Parameters.
   * @param {number} [params.min] Minimum value for slider and input.
   * @param {number} [params.max] Maximum value for slider and input.
   * @param {string} [params.label] Label for panel
   * @param {object} callbacks Callbacks.
   * @param {function} [callbacks.onValueChanged] Callback when value changed.
   * @param {function} [callbacks.onMaxValueChanged] Callback when a slider's max value changed.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = Util.extend({
      label: '',
      min: 0,
      unit: ''
    }, params);

    this.dynamicMaxValue = FALLBACK_MAX_VALUE;

    this.callbacks = Util.extend({
      onValueChanged: () => {},
      onMaxValueChanged: () => {}
    }, callbacks);

    this.dom = document.createElement('div');
    this.dom.classList.add('slider-panel-container');

    const panel = document.createElement('div');
    panel.classList.add('slider-panel');
    this.dom.append(panel);

    const uuid = H5P.createUUID();

    const label = document.createElement('label');
    label.classList.add('slider-panel-label');
    label.setAttribute('id', uuid);
    label.textContent = this.params.label;
    panel.append(label);

    this.slider = new Slider(
      {
        minValue: this.params.min,
        maxValue: this.params.max || this.dynamicMaxValue,
        ariaLabelUUID: uuid
      },
      {
        onSeeked: (value) => {
          this.handleSliderSeeked(value);
          this.callbacks.onValueChanged(value);
        },
        onEnded: (value) => {
          this.handleSliderEnded(value);
          this.callbacks.onValueChanged(value);
        }
      }
    );
    panel.append(this.slider.getDOM());

    this.input = new InputField(
      {
        min: this.params.min,
        max: this.params.max,
        unit: this.params.unit,
        baseMax: this.params.max,
        ariaLabelUUID: uuid
      }, {
        onInput: (value) => {
          this.handleInputInput(value);
          this.callbacks.onValueChanged(value);
        },
        onBlur: () => {
          this.handleInputBlur();
        }
      }
    );
    panel.append(this.input.getDOM());

    const unit = document.createElement('span');
    unit.classList.add('slider-panel-unit');

    unit.textContent = this.params.unit;
    panel.append(unit);
  }

  /**
   * Determine whether the panel has a fixed max value.
   * @returns {boolean} True if the panel has a fixed max value, else false.
   */
  hasFixedMaxValue() {
    return !!this.params.max;
  }

  /**
   * Get DOM.
   * @returns {HTMLElement} DOM.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Get value.
   * @returns {number} Value.
   */
  getValue() {
    return this.input.getValue();
  }

  /**
   * Set value.
   * @param {number} value Value.
   */
  setValue(value) {
    this.slider.setValue(value);
    this.input.setValue(value);
  }

  /**
   * Get max value.
   * @returns {number} Max value.
   */
  getMaxValue() {
    return this.params.max || this.dynamicMaxValue;
  }

  /**
   * Set the maximum value that the slider can be dragged to.
   * @param {number} value Maximum value.
   */
  setMaxDragValue(value) {
    this.dynamicMaxValue = value;

    this.slider.setDragMaxValue(value);
  }

  getId() {
    return this.params.id;
  }

  /**
   * Compute next max value from base value scaled by the power of 10.
   * @param {number} value Current value.
   * @param {number} [base] Base value.
   * @returns {number} Next max value.
   */
  computeNextMaxValue(value, base = FALLBACK_MAX_VALUE) {
    const adjustedValue = Math.max(value + 1, base);
    const exponent = Math.ceil(Math.log10(adjustedValue / base));
    return base * Math.pow(10, exponent);
  }

  /**
   * Handle slider seeked.
   * @param {number} value Current value.
   */
  handleSliderSeeked(value) {
    if (!this.hasFixedMaxValue()) {
      this.dynamicMaxValue = this.computeNextMaxValue(value);
    }

    this.input.setValue(value);
  }

  /**
   * Handle slider ended.
   * @param {number} value Current value.
   */
  handleSliderEnded(value) {
    const nextMaxValue = this.computeNextMaxValue(value);
    if (!this.hasFixedMaxValue() && (value === this.slider.getMaxValue() || value < this.dynamicMaxValue)) {
      this.dynamicMaxValue = nextMaxValue;
      this.slider.setMaxValue(this.dynamicMaxValue);
      this.callbacks.onMaxValueChanged();
      // this.slider.setValue(value);
    }
  }

  /**
   * Handle input field input.
   * @param {number} value Current value.
   */
  handleInputInput(value) {
    if (!this.hasFixedMaxValue()) {
      this.dynamicMaxValue = this.computeNextMaxValue(value);
      this.slider.setMaxValue(this.dynamicMaxValue);
      this.callbacks.onMaxValueChanged();
    }

    this.slider.setValue(value);
  }

  /**
   * Handle input field blur.
   * @param {number} value Current value.
   */
  handleInputBlur(value) {
    if (typeof value !== 'number' || isNaN(value) || value < this.params.min || value > this.params.max) {
      this.input.setValue(this.slider.getValue());
    }
  }

  /**
   * Reset panel.
   */
  reset() {
    this.slider.reset();
    this.input.reset();
  }
}
