// @flow
import { Image, Text, View } from 'react-native';
import React, { Component } from 'react';

import type { $ImageCapture } from './types';

const NUM_IMAGES = 4;
const TIME_TO_START_MS = 10000;
const TIME_BETWEEN_TAKES_MS = 5000;

type SessionProps = {
  imageCapture: $ImageCapture,
  onComplete: (images: Array<string>) => void
};

type SessionState = {
  images: Array<string>,
  imagesLeft: number,
  nextPhotoAt: number,
  secondsLeft: number,
  takingPhoto: boolean
};

const formatSeconds = (ms) => Math.ceil(ms / 1000);

export default class Session extends Component<SessionProps, SessionState> {
  _text: HTMLDivElement;

  constructor(props: SessionProps, context: any) {
    super(props, context);
    this.state = {
      images: [],
      imagesLeft: NUM_IMAGES,
      secondsLeft: formatSeconds(TIME_TO_START_MS),
      nextPhotoAt: Date.now() + TIME_TO_START_MS,
      takingPhoto: false
    };
  }

  componentDidMount() {
    window.requestAnimationFrame(this._setTick);
    setTimeout(this._takePhoto, TIME_TO_START_MS + 1000);
  }

  render() {
    const { images, secondsLeft } = this.state;
    return (
      <View>
        <Text ref={this._receiveRef}>{secondsLeft}</Text>
        {images.map((image, i) => <Image key={i} source={{ uri: image, width: 200, height: 150 }} />)}
      </View>
    );
  }

  _receiveRef = (ref: ?HTMLDivElement) => {
    if (!this._text && ref) {
      this._text = ref;
    }
  };

  _setTick = () => {
    const { nextPhotoAt, takingPhoto } = this.state;
    if (takingPhoto) {
      return;
    }

    const timeLeftMs = Math.max(nextPhotoAt - Date.now(), 0);
    this._text.innerText = `${formatSeconds(timeLeftMs)}`;
    if (timeLeftMs < 0) {
      this.setState({ takingPhoto: true });
    } else {
      window.requestAnimationFrame(this._setTick);
    }
  };

  _takePhoto = () => {
    const { imageCapture, onComplete } = this.props;
    imageCapture.takePhoto().then((blob) => {
      const { images: prevImages } = this.state;
      const images = [...prevImages, URL.createObjectURL(blob)];

      if (images.length >= NUM_IMAGES) {
        // onComplete(images);
        return;
      }

      this.setState(({ imagesLeft }) => {
        setTimeout(this._takePhoto, TIME_BETWEEN_TAKES_MS + 1000);
        return {
          images,
          imagesLeft: imagesLeft - 1,
          nextPhotoAt: Date.now() + TIME_BETWEEN_TAKES_MS,
          takingPhoto: false
        };
      }, this._setTick);
    });
  };
}
