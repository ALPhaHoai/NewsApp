import React from 'react';
import {Image, TouchableOpacity, ImageProps, View} from 'react-native';
import useZoomStore from '@store/useZoomStore.ts';

interface Props extends Omit<ImageProps, 'source'> {
  source: {uri: string};
  caption?: string;
  fallbackTitle?: string;
  style?: any;
  containerStyle?: any;
}

const ImageWithZoomAndDownload: React.FC<Props> = ({
  source,
  caption,
  fallbackTitle,
  style,
  containerStyle,
  ...rest
}) => {
  const showOverlay = useZoomStore(state => state.showOverlay);

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        onPress={() => showOverlay(source, caption, fallbackTitle)}>
        <Image source={source} style={style} {...rest} />
      </TouchableOpacity>
    </View>
  );
};

export default ImageWithZoomAndDownload;
