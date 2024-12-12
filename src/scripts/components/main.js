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

    const sliderPanels = {};
    const resultsPanels = [];

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

    const options = [
      { label: 'Beton', unit: 't', weights: [175, 96.6], max: 1000 },
      { label: 'Fichtenholz', unit: 't', weights: [75, 963.6], max: 1000 },
      { label: 'Lehmziegel', unit: 't', weights: [25, 303.1], max: 1000 },
    ];

    options.forEach((option) => {
      sliderPanels[option.label] = new SliderPanel(
        { label: option.label, unit: option.unit, max: option.max },
        {
          onValueChanged: (value) => {
            updateResults();
          }
        }
      );
      slidersDOM.append(sliderPanels[option.label].getDOM());
    });

    targets.forEach((target) => {
      const resultsPanel = new ResultsPanel(
        { label: target.label, unit: target.unit }
      );
      resultsPanels.push(resultsPanel);
      resultsDOM.append(resultsPanel.getDOM());
    });

    const maxLabelLength = Math.max(...options.map((option) => (option.label ?? '').length));
    this.dom.style.setProperty('--label-width', `${maxLabelLength}ch`);

    const units = options.map((option) => option.unit).concat(targets.map((target) => target.unit));
    const maxUnitLength = Math.max(...units.map((unit) => (unit ?? '').length));
    this.dom.style.setProperty('--unit-width', `${maxUnitLength}ch`);
    if (maxUnitLength === 0) {
      this.dom.style.setProperty('--unitless', '1');
    }

    const updateResults = () => {
      resultsPanels.forEach((resultsPanel, index) => {
        const resultValue = options.reduce((acc, option) => {
          const weight = option.weights[index];
          const value = sliderPanels[option.label].getValue();
          return acc + weight * value;
        }, 0);

        resultsPanel.setValue(Math.round(resultValue));
      });
    };

    updateResults();
  }

  /**
   * Get main DOM.
   * @returns {HTMLElement} Main DOM.
   */
  getDOM() {
    return this.dom;
  }
}
