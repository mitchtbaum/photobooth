// @flow
import Preview from './Preview';
import PhotoSession from './PhotoSession';
import { Button, StyleSheet, View } from 'react-native';
import React, { Component } from 'react';

import type { $ImageCapture } from '../types';

type Props = {};

type State = {
  imageCapture?: $ImageCapture,
  takingPhotos: boolean
};

export default class App extends Component<Props, State> {
  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      takingPhotos: false
    };
  }

  componentDidMount() {
    this._createImageCapture();
  }

  render() {
    const { imageCapture, takingPhotos } = this.state;
    return (
      <View style={styles.root}>
        <View style={styles.container}>
          {takingPhotos ? (
            <View style={styles.content}>
              <PhotoSession imageCapture={imageCapture} onComplete={this._handleComplete} />
            </View>
          ) : (
            <View style={styles.content}>
              <View style={styles.startButton}>
                <Button onPress={this._handleSessionStart} title="New Session" />
              </View>
              {imageCapture ? <Preview imageCapture={imageCapture} /> : null}
            </View>
          )}
        </View>
      </View>
    );
  }

  _handleSessionStart = () => {
    this.setState({ takingPhotos: true });
  };

  _handleComplete = (images: Array<string>) => {
    this.setState({ takingPhotos: false }, this._resetImageCapture);
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
        video: { facingMode: 'user' }
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
