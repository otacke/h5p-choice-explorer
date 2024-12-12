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

    // Sanitize parameters
    const defaults = Util.extend({}, getSemanticsDefaults());
    this.params = Util.extend(defaults, params);

    this.contentId = contentId;
    this.extras = extras;

    // Fill dictionary
    this.dictionary = new Dictionary();
    this.dictionary.fill({ l10n: this.params.l10n, a11y: this.params.a11y });

    this.previousState = extras?.previousState || {};

    this.main = new Main();
  }

  /**
   * Register task introduction text and optional media via H5P.Question.
   */
  registerDomElements() {
    // Set optional media
    const media = this.params.media.type;
    if (media?.library) {
      const type = media.library.split(' ')[0];

      // Image
      if (type === 'H5P.Image' && media.params?.file) {
        this.setImage(media.params.file.path, {
          disableImageZooming: this.params.media.disableImageZooming,
          alt: media.params.alt,
          title: media.params.title,
          expandImage: media.params.expandImage,
          minimizeImage: media.params.minimizeImage
        });
      }
      // Video
      else if (type === 'H5P.Video' && media.params?.sources) {
        this.setVideo(media);
      }
      // Audio
      else if (type === 'H5P.Audio' && media.params?.files) {
        this.setAudio(media);
      }
    }

    // Register task introduction text
    if (this.params.taskDescription) {
      const introduction = document.createElement('div');
      introduction.innerHTML = this.params.taskDescription;
      this.setIntroduction(introduction);
    }

    this.setContent(this.main.getDOM());
  }
}
