// @flow
import PhotoSet from './PhotoSet';
import PhotoTimer from './PhotoTimer';
import { Button, StyleSheet, View } from 'react-native';
import React, { Component } from 'react';

import type { $ImageCapture } from './types';

type PhotoSessionProps = {
  countdownMS: number,
  imageCapture: $ImageCapture,
  initialCountdownMS: number,
  numPhotos: number,
  onComplete?: (imageURLs: Array<string>, imageBlobs: Array<Blob>) => void,
  onPhotoTaken?: (imageURL: string, imageBlob: Blob) => void
};

type PhotoSessionState = {
  imageBlobs: Array<Blob>,
  imageURLs: Array<string>
};

const BETWEEN_TAKE_DELAY_MS = 1000;

export default class PhotoSession extends Component<PhotoSessionProps, PhotoSessionState> {
  _timer: PhotoTimer;
  _photoset: PhotoSet;

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
    if (this._timer) {
      this._timer.start(this.props.initialCountdownMS);
    }
  }

  render() {
    const { numPhotos } = this.props;
    const { imageURLs } = this.state;
    return (
      <View style={styles.root}>
        <View style={styles.timer} pointerEvents="none">
          {imageURLs.length >= numPhotos ? (
            <Button onPress={this._handleComplete} title="Done" />
          ) : (
            <PhotoTimer onTakePhoto={this._handleTakePhoto} ref={this._receiveTimerRef} />
          )}
        </View>
        <PhotoSet downloadable={imageURLs.length === numPhotos} imageURLs={imageURLs} />
      </View>
    );
  }

  _receiveTimerRef = (ref: ?any) => {
    if (ref) {
      this._timer = ref;
    }
  };

  _handleTakePhoto = () => {
    const { countdownMS, imageCapture, numPhotos, onPhotoTaken } = this.props;
    imageCapture
      .takePhoto()
      .then((blob) => {
        const imageURL = URL.createObjectURL(blob);
        onPhotoTaken && onPhotoTaken(imageURL, blob);

        this.setState(({ imageBlobs, imageURLs }) => {
          const nextImageBlobs = [...imageBlobs, blob];
          const nextImageURLs = [...imageURLs, imageURL];
          const shouldTakeAnotherPhoto = nextImageURLs.length < numPhotos;
          if (shouldTakeAnotherPhoto) {
            setTimeout(() => {
              this._timer.start(countdownMS);
            }, BETWEEN_TAKE_DELAY_MS);
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

  _handleComplete = () => {
    const { onComplete } = this.props;
    const { imageBlobs, imageURLs } = this.state;
    onComplete && onComplete(imageURLs, imageBlobs);
  };
}

const styles = StyleSheet.create({
  root: {
    height: '100%',
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  image: {
    width: '50%',
    height: '50%'
  },
  timer: {
    position: 'absolute',
    zIndex: 1,
    height: '100%',
    width: '100%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
