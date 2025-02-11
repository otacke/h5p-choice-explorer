import Util from '@services/util.js';
import Dictionary from '@services/dictionary.js';
import { getSemanticsDefaults } from '@services/h5p-util.js';
import Main from '@components/main.js';
import '@styles/h5p-lisum.scss';

export default class Lisum extends H5P.Question {
  /**
   * @class
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    super('lisum');

    this.params = this.sanitizeParameters(params);
    this.contentId = contentId;
    this.extras = extras;

    this.dictionary = new Dictionary().fill({ l10n: this.params.l10n, a11y: this.params.a11y });

    this.previousState = extras?.previousState || {};

    this.main = new Main();
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

  sanitizeParameters(params = {}) {
    const defaults = Util.extend({}, getSemanticsDefaults());
    return Util.extend(defaults, params);
  }
}
