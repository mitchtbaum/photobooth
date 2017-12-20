// @flow
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

import type { $ImageCapture } from './types';

type PreviewProps = {
  imageCapture: $ImageCapture
};

export default class Preview extends Component<PreviewProps> {
  _ctx: CanvasRenderingContext2D;
  _width: number;

  componentDidMount() {
    window.requestAnimationFrame(this._drawFrame);
  }

  render() {
    return (
      <View style={styles.root}>
        <canvas ref={this._receiveRef} />
      </View>
    );
  }

  _receiveRef = (ref: ?HTMLCanvasElement) => {
    if (!this._ctx && ref) {
      const parent = ref.parentElement;
      // $FlowFixMe
      ref.width = parent.offsetWidth;
      // $FlowFixMe
      ref.height = parent.offsetHeight;
      this._width = ref.width;
      this._ctx = ref.getContext('2d');
    }
  };

  _drawFrame = () => {
    const { imageCapture } = this.props;
    const { aspectRatio, height, width } = imageCapture.track.getSettings();
    if (this._ctx) {
      imageCapture
        .grabFrame()
        .then((imageBitmap) => {
          this._ctx.drawImage(imageBitmap, 0, 0, width, height, 0, 0, this._width, this._width / aspectRatio);
        })
        .catch(() => {});
    }

    window.requestAnimationFrame(this._drawFrame);
  };
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1
  }
});
