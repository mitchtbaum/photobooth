// @flow
import { Button, StyleSheet, View } from 'react-native';
import React, { Component } from 'react';

type PhotoSetProps = {
  downloadable: boolean,
  imageURLs: Array<string>
};

type PhotoSetState = {
  drawn: boolean
};

export default class PhotoSet extends Component<PhotoSetProps, PhotoSetState> {
  _ref: HTMLCanvasElement;
  _ctx: CanvasRenderingContext2D;
  _width: number;
  _height: number;

  static defaultProps = {
    downloadable: false
  };

  constructor(props: PhotoSetProps, context: any) {
    super(props, context);
    this.state = { drawn: false };
  }

  componentWillReceiveProps(nextProps: PhotoSetProps) {
    if (nextProps.imageURLs !== this.props.imageURLs) {
      this.setState({ drawn: false });
    }
  }

  componentDidUpdate(prevProps: PhotoSetProps) {
    if (this.props.imageURLs !== prevProps.imageURLs) {
      this._draw();
    }
  }

  render() {
    const { drawn } = this.state;
    const { downloadable } = this.props;
    return (
      <View style={styles.root}>
        {downloadable && drawn ? (
          <a download="photobooth.jpg" href={this.toDataURL()}>
            Download
          </a>
        ) : null}
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
      this._height = ref.height;
      this._ctx = ref.getContext('2d');
      this._ref = ref;
    }
  };

  _draw = () => {
    const { imageURLs } = this.props;
    const halfWidth = this._width / 2;
    const halfHeight = this._height / 2;
    imageURLs.forEach((imageURL, i) => {
      const img = new Image();
      img.onload = () => {
        this.setState(() => {
          this._ctx.drawImage(img, (i % 2) * halfWidth, (Math.floor(i / 2) % 2) * halfHeight, halfWidth, halfHeight);
          return { drawn: true };
        });
      };
      img.src = imageURL;
    });
  };

  toDataURL = (type: string = 'image/jpeg') => {
    return this._ref.toDataURL(type);
  };
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1
  }
});
