// @flow
import Preview from './Preview';
import Session from './Session';
import { Button, StyleSheet, View } from 'react-native';
import React, { Component } from 'react';

import type { $ImageCapture } from './types';

type AppProps = {};

type AppState = {
  imageCapture?: $ImageCapture,
  inSession: boolean
};

export default class App extends Component<AppProps, AppState> {
  _imageCapture: any;

  constructor(props: AppProps, context: any) {
    super(props, context);
    this.state = {
      inSession: false
    };
  }

  componentDidMount() {
    window.navigator.mediaDevices.getUserMedia({ video: true }).then((mediaStream) => {
      const track = mediaStream.getVideoTracks()[0];
      this.setState({ imageCapture: new window.ImageCapture(track) });
    });
  }

  render() {
    const { imageCapture, inSession } = this.state;
    return (
      <View style={styles.root}>
        {inSession ? (
          <Session imageCapture={imageCapture} onComplete={this._handleSessionComplete} />
        ) : (
          <View>
            <Button onPress={this._handleSessionStart} title="New Session" />
            {imageCapture ? <Preview imageCapture={this.state.imageCapture} /> : null}
          </View>
        )}
      </View>
    );
  }

  _handleSessionStart = () => {
    this.setState({ inSession: true });
  };

  _handleSessionComplete = () => {
    this.setState({ inSession: false });
  };

  _endSession = () => {
    if (this._imageCapture) {
      this._imageCapture.track.stop();
      this._imageCapture = null;
    }
  };
}

const styles = StyleSheet.create({
  root: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
