// @flow
import ReactDOM from 'react-dom';
import { Text } from 'react-native';
import React, { Component } from 'react';

import type { $ImageCapture } from './types';

type PhotoTimerProps = {
  countdownMS: number,
  imageCapture: $ImageCapture,
  imageCount: number,
  initialCountdownMS: number,
  onPhotoTaken: (image: string) => void,
  onComplete: (images: Array<string>) => void
};

type PhotoTimerState = {
  images: Array<string>,
  nextPhotoAt: number,
  takingPhoto: boolean
};

const formatSeconds = (ms) => Math.ceil(ms / 1000);

export default class PhotoTimer extends Component<PhotoTimerProps, PhotoTimerState> {
  _text: ?Text;

  static defaultProps = {
    countdownMS: 2000,
    imageCount: 4,
    initialCountdownMS: 3000
  };

  constructor(props: PhotoTimerProps, context: any) {
    super(props, context);
    this.state = {
      images: [],
      nextPhotoAt: Date.now() + this.props.initialCountdownMS,
      takingPhoto: false
    };
  }

  componentDidMount() {
    window.requestAnimationFrame(this._setTick);
    setTimeout(this._takePhoto, this.props.initialCountdownMS + 1000);
  }

  render() {
    const { initialCountdownMS } = this.props;
    const { nextPhotoAt } = this.state;
    return nextPhotoAt > 0 ? <Text ref={this._receiveRef}>{formatSeconds(initialCountdownMS)}</Text> : null;
  }

  _receiveRef = (ref: ?any) => {
    if (!this._text && ref) {
      this._text = ReactDOM.findDOMNode(ref);
    }
  };

  _setTick = () => {
    const { nextPhotoAt, takingPhoto } = this.state;
    if (takingPhoto || nextPhotoAt <= 0) {
      return;
    }

    const timeLeftMs = Math.max(nextPhotoAt - Date.now(), 0);
    if (this._text) {
      // $FlowFixMe
      this._text.innerText = `${formatSeconds(timeLeftMs)}`;
    }
    if (timeLeftMs < 0) {
      this.setState({ takingPhoto: true });
    } else {
      window.requestAnimationFrame(this._setTick);
    }
  };

  _takePhoto = () => {
    const { countdownMS, imageCapture, imageCount, onComplete, onPhotoTaken } = this.props;
    imageCapture.takePhoto().then((blob) => {
      const image = URL.createObjectURL(blob);
      onPhotoTaken(image);

      this.setState(({ images }) => {
        const nextImages = [...images, image];
        const shouldTakeAnotherPhoto = images.length + 1 < imageCount;
        if (shouldTakeAnotherPhoto) {
          setTimeout(this._takePhoto, countdownMS + 1000);
        } else {
          onComplete(nextImages);
        }
        return {
          images: nextImages,
          nextPhotoAt: shouldTakeAnotherPhoto ? Date.now() + countdownMS : 0,
          takingPhoto: false
        };
      }, this._setTick);
    });
  };
}
