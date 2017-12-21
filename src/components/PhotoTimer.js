// @flow
import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { StyleSheet, Text } from 'react-native';

type PhotoTimerProps = {
  onTakePhoto: () => void
};

type PhotoTimerState = {
  nextPhotoAt: number
};

const formatSeconds = (ms) => Math.ceil(ms / 1000);

export default class PhotoTimer extends Component<PhotoTimerProps, PhotoTimerState> {
  _text: ?Text;

  static defaultProps = {
    initialCountdownMS: 3000
  };

  constructor(props: PhotoTimerProps, context: any) {
    super(props, context);
    this.state = {
      nextPhotoAt: 0
    };
  }

  start = (countdownMS: number) => {
    this.setState({ nextPhotoAt: Date.now() + countdownMS }, () => {
      window.requestAnimationFrame(this._setTick);
      setTimeout(this.props.onTakePhoto, countdownMS);
    });
  };

  render() {
    const { nextPhotoAt } = this.state;
    return nextPhotoAt > 0 ? <Text ref={this._receiveRef} style={styles.text} /> : null;
  }

  _receiveRef = (ref: ?any) => {
    if (!this._text && ref) {
      this._text = ReactDOM.findDOMNode(ref);
    }
  };

  _setTick = () => {
    const { nextPhotoAt } = this.state;
    if (nextPhotoAt <= 0) {
      return;
    }

    const timeLeftMs = Math.max(nextPhotoAt - Date.now(), 0);
    if (this._text) {
      // $FlowFixMe
      this._text.innerText = `${formatSeconds(timeLeftMs)}`;
    }
    if (timeLeftMs < 0) {
      this.props.onTakePhoto();
    } else {
      window.requestAnimationFrame(this._setTick);
    }
  };
}

const styles = StyleSheet.create({
  text: {
    color: 'white',
    fontSize: '4rem',
    textShadowColor: 'black',
    textShadowOffset: { height: 0, width: 0 },
    textShadowRadius: 6
  }
});
