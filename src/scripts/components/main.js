import SliderPanel from './slider-panel/slider-panel.js';
import ResultsPanel from './results-panel/results-panel.js';
import './main.scss';

/**
 * Main DOM component incl. main controller
 */
export default class Main {

  /**
   * @class Main
   * @param {object} params Parameters.
   * @param {object} callbacks Callbacks.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = params;

    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-lisum-main');

    this.sliderPanels = {};
    this.resultsPanels = [];

    const slidersDOM = document.createElement('div');
    slidersDOM.classList.add('h5p-lisum-slider-panels');
    this.dom.append(slidersDOM);

    const resultsDOM = document.createElement('div');
    resultsDOM.classList.add('h5p-lisum-results-panels');
    this.dom.append(resultsDOM);

    this.params.options.forEach((option) => {
      this.sliderPanels[option.label] = new SliderPanel(
        { label: option.label, unit: option.unit, min: option.min, max: option.max },
        {
          onValueChanged: () => {
            this.updateResults();
          },
          onMaxValueChanged: () => {
            this.updateInputfieldsWidth();
          }
        }
      );
      slidersDOM.append(this.sliderPanels[option.label].getDOM());
    });

    this.params.targets.forEach((target) => {
      const resultsPanel = new ResultsPanel(
        {
          label: target.label,
          unit: target.unit,
          min: target.min,
          max: target.max,
          givesLiveFeedback: this.params.behaviour.givesLiveFeedback
        }
      );
      this.resultsPanels.push(resultsPanel);
      resultsDOM.append(resultsPanel.getDOM());
    });

    const maxLabelLength = Math.max(...this.params.options.map((option) => (option.label ?? '').length));
    this.dom.style.setProperty('--label-width', `${maxLabelLength}ch`);

    const units = this.params.options
      .map((option) => option.unit)
      .concat(this.params.targets.map((target) => target.unit));
    const maxUnitLength = Math.max(...units.map((unit) => (unit ?? '').length));
    this.dom.style.setProperty('--unit-width', `${maxUnitLength}ch`);

    this.updateInputfieldsWidth();
    this.updateResults();
  }

  /**
   * Get main DOM.
   * @returns {HTMLElement} Main DOM.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Update results.
   */
  updateResults() {
    let maxMaxValue = 0;

    this.resultsPanels.forEach((resultsPanel, index) => {
      const resultValue = this.params.options.reduce((acc, option) => {
        const weight = option.weights[index];
        const value = this.sliderPanels[option.label].getValue();
        return acc + weight * value;
      }, 0);

      resultsPanel.setValue(Math.round(resultValue));
      maxMaxValue = Math.max(maxMaxValue,  Math.ceil(Math.log10(Math.round(resultValue))));
    });

    this.dom.style.setProperty('--max-result-digits', `${maxMaxValue}`);
  }

  updateInputfieldsWidth() {
    const maxMaxValue = Math.max(...Object.values(this.sliderPanels).map((sliderPanel) => sliderPanel.getMaxValue()));
    const maxMaxValueLength = Math.ceil(Math.log10(maxMaxValue));
    this.dom.style.setProperty('--max-input-field-digits', `${maxMaxValueLength}`);
  }
}
