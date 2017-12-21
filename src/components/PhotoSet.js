// @flow
import Link from './Link';
import { StyleSheet, View } from 'react-native';
import React, { Component } from 'react';

type Props = {
  downloadable: boolean,
  gutter: number,
  imageURLs: Array<string>
};

type State = {
  drawCount: number
};

const WIDTH = 1600;
const HEIGHT = 2400;
const GUTTER = 10;

export default class PhotoSet extends Component<Props, State> {
  _ref: HTMLCanvasElement;
  _ctx: CanvasRenderingContext2D;

  static defaultProps = {
    downloadable: false,
    gutter: GUTTER
  };

  constructor(props: Props, context: any) {
    super(props, context);
    this.state = { drawCount: 0 };
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.imageURLs !== this.props.imageURLs) {
      this.setState({ drawCount: 0 });
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.imageURLs !== prevProps.imageURLs) {
      this._draw();
    }
  }

  componentDidMount() {
    this._draw();
  }

  render() {
    const { drawCount } = this.state;
    const { downloadable, imageURLs } = this.props;
    return (
      <View style={styles.root}>
        {downloadable && drawCount === imageURLs.length ? (
          <Link download="photobooth.jpg" href={this.toDataURL()} isButton>
            Download
          </Link>
        ) : null}
        <View style={styles.canvas}>
          <canvas ref={this._receiveRef} height={HEIGHT} width={WIDTH} />
        </View>
      </View>
    );
  }

  _receiveRef = (ref: ?HTMLCanvasElement) => {
    if (!this._ctx && ref) {
      this._ctx = ref.getContext('2d');
      this._ctx.fillStyle = '#000000';
      this._ctx.fillRect(0, 0, WIDTH, HEIGHT);
      this._ref = ref;
    }
  };

  _draw = () => {
    const { gutter, imageURLs } = this.props;
    const halfWidth = WIDTH / 2;
    const quarterHeight = HEIGHT / 4;
    const width = halfWidth - gutter * 2;
    const height = quarterHeight - gutter * 2;
    imageURLs.forEach((imageURL, i) => {
      const img = new Image();
      img.onload = () => {
        this.setState(({ drawCount }) => {
          const yPos = i * quarterHeight + gutter;
          this._ctx.drawImage(img, gutter, yPos, width, height);
          this._ctx.drawImage(img, halfWidth + gutter, yPos, width, height);
          return { drawCount: drawCount + 1 };
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
    // flexGrow: 1
  },
  canvas: {
    position: 'absolute',
    left: '-999em'
  }
});
