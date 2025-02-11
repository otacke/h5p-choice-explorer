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

    const targets = [
      { label: 'CO₂-Ausstoß', unit: 't' },
      { label: 'Kosten', unit: '€' }
    ];

    this.options = [
      { label: 'Beton', unit: 't', weights: [175, 96.6], max: 1000 },
      { label: 'Fichtenholz', unit: 't', weights: [75, 963.6], max: 1000 },
      { label: 'Lehmziegel', unit: 't', weights: [25, 303.1] },
    ];

    this.options.forEach((option) => {
      this.sliderPanels[option.label] = new SliderPanel(
        { label: option.label, unit: option.unit, max: option.max },
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

    targets.forEach((target) => {
      const resultsPanel = new ResultsPanel(
        { label: target.label, unit: target.unit }
      );
      this.resultsPanels.push(resultsPanel);
      resultsDOM.append(resultsPanel.getDOM());
    });

    const maxLabelLength = Math.max(...this.options.map((option) => (option.label ?? '').length));
    this.dom.style.setProperty('--label-width', `${maxLabelLength}ch`);

    const units = this.options.map((option) => option.unit).concat(targets.map((target) => target.unit));
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
      const resultValue = this.options.reduce((acc, option) => {
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
