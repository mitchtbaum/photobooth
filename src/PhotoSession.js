// @flow
import PhotoTimer from './PhotoTimer';
import { Image, StyleSheet, View } from 'react-native';
import React, { Component } from 'react';

import type { $ImageCapture } from './types';

type PhotoSessionProps = {
  numPhotos: number,
  onComplete?: (imageURLs: Array<string>, imageBlobs: Array<blob>) => void,
  onPhotoTaken?: (imageURL: string, imageBlob: blob) => void
};

type PhotoSessionState = {
  imageBlobs: Array<blob>,
  imageURLs: Array<string>
};

export default class PhotoSession extends Component<PhotoSessionProps, PhotoSessionState> {
  _imageCapture: $ImageCapture;
  _timer: PhotoTimer;

  static defaultProps = {
    countdownMS: 2000,
    numPhotos: 4,
    initialCountdownMS: 3000
  };

  constructor(props: PhotoSessionProps, context: any) {
    super(props, context);
    this.state = {
      imageBlobs: [],
      imageURLs: []
    };
  }

  componentDidMount() {
    window.navigator.mediaDevices
      .getUserMedia({
        video: {
          // facingMode: 'user',
          // height: { min: 776, ideal: 720, max: 1080 },
          // width: { min: 1024, ideal: 1280, max: 1920 }
        }
      })
      .then((mediaStream) => {
        const track = mediaStream.getVideoTracks()[0];
        this._imageCapture = new window.ImageCapture(track);
        if (this._timer) {
          this._timer.start(this.props.initialCountdownMS);
        }
      });
  }

  render() {
    const { imageURLs } = this.state;
    return (
      <View style={styles.root}>
        <PhotoTimer onTakePhoto={this._handleTakePhoto} ref={this._receiveTimerRef} />
        {imageURLs.map((url, i) => <Image key={i} source={url} style={styles.image} />)}
      </View>
    );
  }

  _receiveTimerRef = (ref) => {
    if (ref) {
      this._timer = ref;
    }
  };

  _handleTakePhoto = () => {
    const { countdownMS, numPhotos, onComplete, onPhotoTaken } = this.props;
    console.info('taking photo');
    this._imageCapture
      .takePhoto()
      .then((blob) => {
        const imageURL = URL.createObjectURL(blob);
        onPhotoTaken && onPhotoTaken(imageURL, blob);

        this.setState(({ imageBlobs, imageURLs }) => {
          const nextImageBlobs = [...imageBlobs, blob];
          const nextImageURLs = [...imageURLs, imageURL];
          const shouldTakeAnotherPhoto = nextImageURLs.length < numPhotos;
          if (shouldTakeAnotherPhoto) {
            this._timer.start(countdownMS);
          } else {
            onComplete && onComplete();
          }
          return {
            imageBlobs: nextImageBlobs,
            imageURLs: nextImageURLs
          };
        });
      })
      .catch((err) => {
        console.log('error received', err);
      });
  };

  _handleTimerComplete = () => {};
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  image: {
    flexGrow: 0.5
  }
});
