import MessageBox from '@components/message-box/message-box.js';
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
    this.dom.classList.add('h5p-choice-explorer-main');

    if (this.params.decisions.length === 0 || this.params.targets.length === 0) {
      const messageBox = new MessageBox({ text: params.dictionary.get('l10n.missingParameters') });
      this.dom.append(messageBox.getDOM());
      return;
    }

    this.sliderPanels = {};
    this.resultsPanels = [];

    const slidersDOM = document.createElement('div');
    slidersDOM.classList.add('h5p-choice-explorer-slider-panels');
    this.dom.append(slidersDOM);

    const resultsDOM = document.createElement('div');
    resultsDOM.classList.add('h5p-choice-explorer-results-panels');
    this.dom.append(resultsDOM);

    this.params.decisions.forEach((option) => {
      this.sliderPanels[option.id] = new SliderPanel(
        { label: option.label, unit: option.unit, min: option.min, max: option.max },
        {
          onValueChanged: () => {
            this.wasAnswerGiven = true;
            this.updateResults();
          },
          onMaxValueChanged: () => {
            this.updateInputfieldsWidth();
          }
        }
      );
      slidersDOM.append(this.sliderPanels[option.id].getDOM());
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

    const maxLabelLength = Math.max(...this.params.decisions.map((option) => (option.label ?? '').length));
    this.dom.style.setProperty('--label-width', `${maxLabelLength}ch`);

    const units = this.params.decisions
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
      const resultValue = this.params.decisions.reduce((acc, option) => {
        const weight = option.weights[index];
        const value = this.sliderPanels[option.id].getValue();
        return acc + weight * value;
      }, 0);

      const roundedResultValue = Math.round(resultValue);
      resultsPanel.setValue(roundedResultValue);
      maxMaxValue = Math.max(maxMaxValue, Math.ceil(roundedResultValue.toString().length));
    });

    this.dom.style.setProperty('--max-result-digits', `${maxMaxValue}`);
  }

  updateInputfieldsWidth() {
    const maxMaxValue = Math.max(...Object.values(this.sliderPanels).map((sliderPanel) => sliderPanel.getMaxValue()));
    const maxMaxValueLength = Math.ceil(Math.log10(maxMaxValue));
    this.dom.style.setProperty('--max-input-field-digits', `${maxMaxValueLength}`);
  }

  /**
   * Determine whether the task was answered already.
   * @returns {boolean} True if answer was given by user, else false.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-1}
   */
  getAnswerGiven() {
    return this.wasAnswerGiven ?? false;
  }

  /**
   * Reset.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-5}
   */
  reset() {
    if (!this.sliderPanels) {
      return;
    }

    Object.values(this.sliderPanels).forEach((sliderPanel) => {
      sliderPanel.reset();
    });

    this.updateResults();

    this.wasAnswerGiven = false;
  }

  /**
   * Get current state.
   * @returns {object|undefined} Current state to be retrieved later.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-7}
   */
  getCurrentState() {
    if (!this.sliderPanels) {
      return;
    }

    return {
      decisions: Object.entries(this.sliderPanels).map(([id, sliderPanel]) => ({ id, value: sliderPanel.getValue() }))
    };
  }

  /**
   * Set current state.
   * @param {object} state State to set, must match return value structure of getCurrentState.
   */
  setCurrentState(state) {
    if (state.decisions.length === 0) {
      return;
    }

    state.decisions.forEach(({ id, value }) => {
      this.sliderPanels[id].setValue(value);
    });

    this.wasAnswerGiven = true;
    this.updateResults();
  }
}
