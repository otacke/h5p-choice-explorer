import './results-panel.scss';

export default class ResultsPanel {

  /**
   * @class ResultsPanel
   * @param {object} params Parameters.
   * @param {string} [params.label] Label for panel.
   * @param {string} [params.unit] Unit for panel.
   */
  constructor(params = {}) {
    this.dom = document.createElement('div');
    this.dom.classList.add('results-panel-container');

    const panel = document.createElement('div');
    panel.classList.add('results-panel');
    this.dom.append(panel);

    const resultLabel = document.createElement('div');
    resultLabel.classList.add('results-panel-label');
    resultLabel.textContent = params.label ?? '';
    panel.append(resultLabel);

    this.result = document.createElement('input');
    this.result.classList.add('results-panel-value');
    this.result.setAttribute('type', 'number');
    this.result.setAttribute('disabled', 'disabled');
    panel.append(this.result);

    const resultUnit = document.createElement('div');
    resultUnit.classList.add('results-panel-unit');
    resultUnit.textContent = params.unit ?? '';
    panel.append(resultUnit);
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
    if (typeof value !== 'number' || isNaN(value)) {
      return;
    }

    this.result.value = value;
  }
}
