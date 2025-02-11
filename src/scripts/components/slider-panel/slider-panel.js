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
   */
  constructor(params = {}, callbacks = {}) {
    params = Util.extend({
      label: '',
      min: 0,
      unit: ''
    }, params);

    this.maxValue = params.max || FALLBACK_MAX_VALUE;

    callbacks = Util.extend({
      onValueChanged: () => {}
    }, callbacks);

    this.dom = document.createElement('div');
    this.dom.classList.add('slider-panel-container');

    const panel = document.createElement('div');
    panel.classList.add('slider-panel');
    this.dom.append(panel);

    const label = document.createElement('label');
    label.classList.add('slider-panel-label');
    label.textContent = params.label;
    panel.append(label);

    const slider = new Slider(
      {
        minValue: params.min,
        maxValue: this.maxValue,
        ariaLabel: 'TODO' // TODO: Combination of slider and option name
      },
      {
        onSeeked: (value) => {
          this.input.setValue(value);
          callbacks.onValueChanged(value);
        }
      }
    );
    panel.append(slider.getDOM());

    this.input = new InputField(
      {
        min: params.min,
        max: params.max
      }, {
        onInput: (value) => {
          this.maxValue = this.computeNextMaxValue(value);
          slider.setMaxValue(this.maxValue);
          slider.setValue(value);
          callbacks.onValueChanged(value);
        },
        onBlur: () => {
          const value = this.input.getValue();
          if (typeof value !== 'number' || isNaN(value) || value < params.min || value > params.max) {
            this.input.setValue(slider.getValue());
          }
        }
      }
    );
    panel.append(this.input.getDOM());

    const unit = document.createElement('span');
    unit.classList.add('slider-panel-unit');

    unit.textContent = params.unit;
    panel.append(unit);
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

  computeNextMaxValue(value) {
    const adjustedValue = Math.max(value + 1, FALLBACK_MAX_VALUE);
    const exponent = Math.ceil(Math.log10(adjustedValue / FALLBACK_MAX_VALUE));
    return FALLBACK_MAX_VALUE * Math.pow(10, exponent);
  }
}
