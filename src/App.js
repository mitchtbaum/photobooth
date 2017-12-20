// @flow
import Preview from './Preview';
import PhotoSession from './PhotoSession';
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
        <View style={styles.container}>
          {takingPhotos ? (
            <View style={styles.content}>
              <PhotoSession imageCapture={imageCapture} />
            </View>
          ) : (
            <View style={styles.content}>
              <View style={styles.startButton}>
                <Button onPress={this._handleSessionStart} title="New Session" />
              </View>
              {imageCapture ? <Preview imageCapture={imageCapture} /> : null}
            </View>
          )}
          {images.map((image, i) => <Image key={i} source={{ uri: image, width: 200, height: 150 }} />)}
        </View>
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
    this._resetImageCapture();
  };

  _resetImageCapture() {
    if (this.state.imageCapture) {
      this.state.imageCapture.track.stop();
    }
    this._createImageCapture();
  }

  _createImageCapture() {
    window.navigator.mediaDevices
      .getUserMedia({
        video: {
          // facingMode: 'user',
          height: { min: 776, ideal: 720, max: 1080 },
          width: { min: 1024, ideal: 1280, max: 1920 }
        }
      })
      .then((mediaStream) => {
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
  },
  container: {
    height: '600px',
    width: '800px'
  },
  content: {
    flexGrow: 1,
    height: '100%'
  },
  startButton: {
    position: 'absolute',
    zIndex: 1,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
