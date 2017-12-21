// @flow
import { createElement, Button, StyleSheet } from 'react-native';
import React, { Component } from 'react';

const noop = () => {};

const A = (props) => createElement('a', props);

type Props = {
  children: any,
  href: string,
  isButton: boolean
};

export default class Link extends Component<Props> {
  static defaultProps = {
    isButton: false
  };

  render() {
    const { children, href, isButton, ...props } = this.props;
    const content = isButton ? <Button onPress={noop} title={children} /> : children;
    return (
      <A {...props} href={href} styles={styles.link}>
        {content}
      </A>
    );
  }
}

const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'none'
  }
});
