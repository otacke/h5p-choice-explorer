import Util from '@services/util.js';
import Dictionary from '@services/dictionary.js';
import QuestionTypeContract from '@mixins/question-type-contract.js';
import { getSemanticsDefaults } from '@services/h5p-util.js';
import Main from '@components/main.js';
import '@styles/h5p-choice-explorer.scss';

export default class ChoiceExplorer extends H5P.Question {
  /**
   * @class
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    super('choice-explorer');

    Util.addMixins(ChoiceExplorer, [QuestionTypeContract]);

    this.params = this.sanitizeParameters(params);
    this.contentId = contentId;
    this.extras = extras;

    this.dictionary = new Dictionary().fill({ l10n: this.params.l10n, a11y: this.params.a11y });

    // Assign weights to decisions
    this.params.weights.forEach((weight) => {
      const decisionIndex = this.params.decisions.findIndex((decision) => decision.id === weight.decisionId);
      if (decisionIndex === -1) {
        return; // TODO: This will probably need error handling even though it should never happen
      }

      this.params.decisions[decisionIndex].weights = weight.targets.map((target) => target.weight);
    });

    this.main = new Main(this.params);

    this.setCurrentState(extras?.previousState ?? null);
  }

  /**
   * Register task introduction text and optional media via H5P.Question.
   */
  registerDomElements() {
    this.setIntroductoryMedia(this.params.media.type);

    // Register task introduction text, setIntroduction and setContent are methods in H5P.Question
    if (this.params.taskDescription) {
      const introduction = document.createElement('div');
      introduction.innerHTML = this.params.taskDescription;
      this.setIntroduction(introduction);
    }

    this.setContent(this.main.getDOM());
  }

  setIntroductoryMedia(media) {
    if (typeof media?.library !== 'string') {
      return;
    }

    const machineName = media.library.split(' ')[0];

    // setImage, setVideo and setAudio are methods in H5P.Question
    if (machineName === 'H5P.Image' && media.params?.file) {
      const { path } = media.params.file;
      const { disableImageZooming } = this.params.media;
      const { alt, title, expandImage, minimizeImage } = media.params;

      this.setImage(path, { disableImageZooming, alt, title, expandImage, minimizeImage });
    }
    else if (machineName === 'H5P.Video' && media.params?.sources) {
      this.setVideo(media);
    }
    else if (machineName === 'H5P.Audio' && media.params?.files) {
      this.setAudio(media);
    }
  }

  /**
   * Set current state.
   * @param {object} state State to set, must match return value structure of getCurrentState.
   */
  setCurrentState(state) {
    this.main.setCurrentState(this.sanitizeState(state));
  }

  /**
   * Sanitize state.
   * @param {object} [state] State to sanitize.
   * @returns {object} Sanitized state.
   */
  sanitizeState(state) {
    const newState = { decisions: [] };

    const isStateValid = typeof state === 'object' && state !== null && Array.isArray(state.decisions);
    if (isStateValid) {
      state.decisions.forEach(({ id, value }) => {

        const isIdValid = typeof id === 'string' && this.params.decisions.some((decision) => decision.id === id);
        const isValueValid = typeof value === 'number' && value >= 0;

        if (isIdValid && isValueValid) {
          newState.decisions.push({ id, value });
        }
      });
    }

    return newState;
  }

  sanitizeParameters(params = {}) {
    const defaults = Util.extend({}, getSemanticsDefaults());
    return Util.extend(defaults, params);
  }
}
