import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import Image from './Image';
import { isDarkBackground } from '../utils/Color';

export default class Section extends Component {

  constructor() {
    super();
    this._onScroll = this._onScroll.bind(this);
    this._layout = this._layout.bind(this);
    this.state = {};
  }

  componentDidMount() {
    const { plain } = this.props;
    if (!plain) {
      window.addEventListener('scroll', this._onScroll);
      this._layout();
    }
  }

  componentWillUnmount() {
    const { plain } = this.props;
    if (!plain) {
      window.removeEventListener('scroll', this._onScroll);
    }
  }

  _onScroll() {
    // debounce
    clearTimeout(this._scrollTimer);
    this._scrollTimer = setTimeout(this._layout, 10);
  }

  _layout() {
    const { active, leaving } = this.state;
    const component = this._componentRef;
    if (component) {
      const rect = this._componentRef.getBoundingClientRect();
      const nextActive = (rect.top + 48) < window.innerHeight;
      if (nextActive !== active) {
        this.setState({ active: nextActive });
      }
      const nextLeaving = rect.bottom < 240;
      if (nextLeaving !== leaving) {
        this.setState({ leaving: nextLeaving });
      }
    }
  }

  render() {
    const {
      align, backgroundColor, backgroundImage, className, footer, full, plain,
    } = this.props;
    let { style } = this.props;
    const { active, leaving } = this.state;
    let child = Children.only(this.props.children);

    let result;
    if (plain) {
      result = child;
    } else {
      const classNames = ['section__container'];
      if (full) {
        classNames.push('section__container--full');
      }
      if (footer) {
        classNames.push('section__container--footer');
      }
      if (active) {
        classNames.push('section__container--active');
      }
      if (leaving) {
        classNames.push('section__container--leaving');
      }
      if (backgroundImage) {
        if (backgroundImage.dark) {
          classNames.push('dark-background');
        }
      } else if (backgroundColor) {
        style = { ...style, backgroundColor };
        classNames.push('section__container--colored');
        if (isDarkBackground(backgroundColor)) {
          classNames.push('dark-background');
        }
      }
      if (align) {
        classNames.push(`section__container--${align}`);
      }
      if (className) {
        classNames.push(className);
      }

      let background;
      if (backgroundImage) {
        background =
          <Image className="section__background" image={backgroundImage} />;
      }

      child = React.cloneElement(
        child,
        { className: `${child.props.className || ''} section` },
      );

      result = (
        <div ref={(ref) => { this._componentRef = ref; }}
          className={classNames.join(' ')}
          style={style}>
          {background}
          {child}
        </div>
      );
    }

    return result;
  }
}

Section.propTypes = {
  align: PropTypes.oneOf(['center', 'start', 'end']),
  backgroundColor: PropTypes.string,
  backgroundImage: PropTypes.shape({
    data: PropTypes.string,
    path: PropTypes.string,
  }),
  children: PropTypes.any.isRequired,
  className: PropTypes.string,
  footer: PropTypes.bool,
  full: PropTypes.bool,
  plain: PropTypes.bool,
  style: PropTypes.object,
};

Section.defaultProps = {
  align: 'center',
  backgroundColor: undefined,
  backgroundImage: undefined,
  className: undefined,
  footer: false,
  full: false,
  plain: false,
  style: undefined,
};
