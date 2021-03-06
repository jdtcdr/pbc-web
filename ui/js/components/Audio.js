
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Section from './Section';
import Button from './Button';
import PlayIcon from '../icons/Play';
import PauseIcon from '../icons/Pause';
import VolumeIcon from '../icons/Volume';
import DownloadIcon from '../icons/Download';

function pad(num, size) {
  let s = `${num}`;
  while (s.length < size) s = `0${s}`;
  return s;
}

function friendlyDuration(duration) {
  let remaining = duration;
  let result = '';
  if (remaining > 3600) {
    const hours = Math.floor(remaining / 3600);
    result += `${hours}:`;
    remaining -= hours * 3600;
  }
  // always show minutes and seconds, even when 0
  const minutes = Math.floor(remaining / 60);
  result += `${pad(minutes, 2)}:`;
  remaining -= minutes * 60;
  const seconds = Math.floor(remaining);
  result += `${pad(seconds, 2)}`;
  return result;
}

export default class Audio extends Component {

  constructor() {
    super();
    this._onLoaded = this._onLoaded.bind(this);
    this._onTimeUpdate = this._onTimeUpdate.bind(this);
    this._onEnded = this._onEnded.bind(this);
    this._onResize = this._onResize.bind(this);
    this._layout = this._layout.bind(this);
    this._onPlay = this._onPlay.bind(this);
    this._onPause = this._onPause.bind(this);
    this._onSeek = this._onSeek.bind(this);
    this._onToggleVolume = this._onToggleVolume.bind(this);
    this._onVolume = this._onVolume.bind(this);
    this.state = {
      playing: false, volume: 0.7, start: 0, end: 0, at: 0, showVolume: false,
    };
  }

  componentDidMount() {
    const audio = this._audioRef;
    audio.volume = this.state.volume;
    audio.addEventListener('loadedmetadata', this._onLoaded);
    audio.addEventListener('timeupdate', this._onTimeUpdate);
    audio.addEventListener('ended', this._onEnded);
    window.addEventListener('resize', this._onResize);
    this._layout();
  }

  componentDidUpdate() {
    const { autoPlay } = this.props;
    const { playing } = this.state;
    if (autoPlay && !playing) {
      this._onPlay();
    }
  }

  componentWillUnmount() {
    const audio = this._audioRef;
    audio.removeEventListener('loadedmetadata', this._onLoaded);
    audio.removeEventListener('timeupdate', this._onTimeUpdate);
    audio.removeEventListener('ended', this._onEnded);
    window.removeEventListener('resize', this._onResize);
  }

  _onLoaded() {
    const audio = this._audioRef;
    this.setState({ end: audio.duration });
  }

  _onTimeUpdate() {
    const audio = this._audioRef;
    this.setState({ at: audio.currentTime });
  }

  _onEnded() {
    const { onEnd } = this.props;
    this.setState({ playing: false, at: 0 });
    if (onEnd) {
      onEnd();
    }
  }

  _onResize() {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(this._layout, 10);
  }

  _layout() {
    // Remove?
  }

  _onPlay() {
    const { onStart } = this.props;
    const audio = this._audioRef;
    audio.play();
    this.setState({
      playing: true,
      // start: audio.seekable.start(0),
      // end: audio.seekable.end(0),
    });
    if (onStart) {
      onStart();
    }
  }

  _onPause() {
    const audio = this._audioRef;
    audio.pause();
    this.setState({ playing: false });
  }

  _onSeek(event) {
    const audio = this._audioRef;
    const value = event.target.value;
    audio.currentTime = value;
    this.setState({ at: value });
  }

  _onToggleVolume() {
    this.setState({ showVolume: !this.state.showVolume });
  }

  _onVolume(event) {
    const audio = this._audioRef;
    const value = event.target.value;
    audio.volume = value;
    this.setState({ volume: value });
  }

  render() {
    const { file, className, color, full, plain } = this.props;
    const { playing, volume, start, end, at, showVolume } = this.state;
    const path = `/api/files/${file._id}/${file.name}`;

    const classes = ['audio'];
    if (plain) {
      classes.push('audio--plain');
    }
    if (className) {
      classes.push(className);
    }

    const label = file.label || 'Listen';

    let playControl;
    if (playing) {
      playControl = (
        <Button className="audio__toggle" plain={true} onClick={this._onPause}>
          <span>{label}</span>
          <PauseIcon />
        </Button>
      );
    } else {
      playControl = (
        <Button className="audio__toggle" plain={true} onClick={this._onPlay}>
          <span>{label}</span>
          <PlayIcon />
        </Button>
      );
    }

    let volumeControl;
    if (showVolume) {
      volumeControl = (
        <input className="audio__volume"
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={volume}
          onChange={this._onVolume} />
      );
    }

    return (
      <Section backgroundColor={color} full={full} plain={plain}>
        <div className={classes.join(' ')}>
          <audio ref={(ref) => { this._audioRef = ref; }} preload="metadata">
            <source src={path} type={'audio/mpeg' || file.type} />
            No audio with this browser
          </audio>
          <span className="audio__control">
            {playControl}
          </span>
          <input className="audio__position"
            type="range"
            min={start}
            max={end}
            value={at}
            onChange={this._onSeek} />
          <div className="audio__details">
            <span className="audio__duration">{friendlyDuration(end - at)}</span>
            {volumeControl}
            <Button className="audio__volume-toggle button-icon"
              plain={true}
              onClick={this._onToggleVolume}>
              <VolumeIcon />
            </Button>
            <a className="audio__download link-icon" href={path}>
              <DownloadIcon />
            </a>
          </div>
        </div>
      </Section>
    );
  }
}

Audio.propTypes = {
  ...Section.propTypes,
  autoPlay: PropTypes.bool,
  children: PropTypes.any,
  full: PropTypes.bool,
  file: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  onEnd: PropTypes.func,
  onStart: PropTypes.func,
};

Audio.defaultProps = {
  autoPlay: false,
  children: null,
  full: false,
  onEnd: undefined,
  onStart: undefined,
};
