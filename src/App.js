// @flow
import Preview from './Preview';
import PhotoTimer from './PhotoTimer';
import { Button, Image, StyleSheet, View } from 'react-native';
import React, { Component } from 'react';

import type { $ImageCapture } from './types';

type AppProps = {};

type AppState = {
  imageCapture?: $ImageCapture,
  images: Array<string>,
  takingPhotos: boolean
};

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps, context: any) {
    super(props, context);
    this.state = {
      images: [],
      takingPhotos: false
    };
  }

  componentDidMount() {
    this._createImageCapture();
  }

  render() {
    const { imageCapture, images, takingPhotos } = this.state;
    return (
      <View style={styles.root}>
        {takingPhotos ? (
          <View>
            <PhotoTimer
              imageCapture={imageCapture}
              onComplete={this._handleComplete}
              onPhotoTaken={this._handlePhotoTaken}
            />
          </View>
        ) : (
          <View>
            <Button onPress={this._handleSessionStart} title="New Session" />
            {imageCapture ? <Preview imageCapture={imageCapture} /> : null}
          </View>
        )}
        {images.map((image, i) => <Image key={i} source={{ uri: image, width: 200, height: 150 }} />)}
      </View>
    );
  }

  _handleSessionStart = () => {
    this.setState({ images: [], takingPhotos: true });
  };

  _handlePhotoTaken = (image: string) => {
    this.setState(({ images }) => ({ images: [...images, image] }));
  };

  _handleComplete = (images: Array<string>) => {
    if (this.state.imageCapture) {
      this.state.imageCapture.track.stop();
    }
    this._createImageCapture();
  };

  _createImageCapture() {
    window.navigator.mediaDevices.getUserMedia({ video: true }).then((mediaStream) => {
      const track = mediaStream.getVideoTracks()[0];
      this.setState({ imageCapture: new window.ImageCapture(track), takingPhotos: false });
    });
  }
}

const styles = StyleSheet.create({
  root: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
