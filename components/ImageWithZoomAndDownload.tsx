import React, {useEffect, useMemo, useState} from 'react';
import {
  Dimensions,
  Image,
  LayoutChangeEvent,
  TouchableOpacity,
  View,
} from 'react-native';
import useZoomStore from '@store/useZoomStore.ts';
import FastImage, {FastImageProps} from 'react-native-fast-image';

interface Props extends Omit<FastImageProps, 'source'> {
  source: {uri: string};
  caption?: string;
  fallbackTitle?: string;
  style?: any;
  containerStyle?: any;
}

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const ImageWithZoomAndDownload: React.FC<Props> = ({
  source,
  caption,
  fallbackTitle,
  style,
  containerStyle,
  ...rest
}) => {
  const showOverlay = useZoomStore(state => state.showOverlay);
  const [aspectRatio, setAspectRatio] = useState<number>();
  const [containerWidth, setContainerWidth] = useState(screenWidth);

  useEffect(() => {
    if (source?.uri) {
      Image.getSize(
        source?.uri,
        (width, height) => {
          if (width && height) {
            const ratio = height / width;
            setAspectRatio(ratio);
          }
        },
        error => {
          console.error('Failed to get image size:', error);
        },
      );
    }
  }, [source?.uri]);

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  const height = useMemo(() => {
    if (!aspectRatio) {
      return;
    }
    return (containerWidth - 20) * aspectRatio;
  }, [aspectRatio, containerWidth]);

  return (
    <View style={[containerStyle, {height: height || 200}]} onLayout={onLayout}>
      <TouchableOpacity
        onPress={() => showOverlay(source, caption, fallbackTitle)}>
        <FastImage source={source} style={style} {...rest} />
      </TouchableOpacity>
    </View>
  );
};

export default ImageWithZoomAndDownload;
