import { scrollTo } from '../../utils/scroll';

export default class Anchor {
  constructor(buttonElementClassName) {
    this.buttonElementClassName = buttonElementClassName;

    this.initialize();
  }

  initialize() {
    document.body.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(event) {
    const anchor = event.target.closest(`.${this.buttonElementClassName}`);
    if (anchor) {
      event.preventDefault();
      scrollTo(anchor);
    }
  }
}
