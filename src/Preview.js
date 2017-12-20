// @flow
import React, { Component } from 'react';

import type { $ImageCapture } from './types';

type PreviewProps = {
  imageCapture: $ImageCapture
};

export default class Preview extends Component<PreviewProps> {
  _ctx: CanvasRenderingContext2D;

  componentDidMount() {
    window.requestAnimationFrame(this._drawFrame);
  }

  render() {
    return <canvas ref={this._receiveRef} width={800} height={600} />;
  }

  _receiveRef = (ref: ?HTMLCanvasElement) => {
    if (!this._ctx && ref) {
      this._ctx = ref.getContext('2d');
    }
  };

  _drawFrame = () => {
    const { imageCapture } = this.props;
    if (this._ctx) {
      imageCapture
        .grabFrame()
        .then((imageBitmap) => {
          this._ctx.drawImage(imageBitmap, 0, 0);
        })
        .catch(() => {});
    }

    window.requestAnimationFrame(this._drawFrame);
  };
}
