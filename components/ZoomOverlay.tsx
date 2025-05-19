import React, {useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';
import Svg, {Path} from 'react-native-svg';
import useZoomStore from '@store/useZoomStore.ts';

const window = Dimensions.get('window');

// Download utility
function sanitizeFilename(str: string): string {
  return str.replace(/[/\\?%*:|"<>]/g, '').replace(/\s+/g, '_') + '.jpg';
}
async function saveImgToGallery(
  imageUrl: string,
  captionOrTitle?: string,
): Promise<void> {
  try {
    let hasPermission = true;
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const perm = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        );
        hasPermission = perm === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const perm = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        hasPermission = perm === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Cannot save image to gallery.');
      return;
    }
    const fallback = `IMG_${Date.now()}.jpg`;
    const filename = captionOrTitle
      ? sanitizeFilename(captionOrTitle)
      : fallback;
    const destPath = `${RNFS.CachesDirectoryPath}/${filename}`;
    const result = await RNFS.downloadFile({
      fromUrl: imageUrl,
      toFile: destPath,
    }).promise;
    if (result.statusCode !== 200) {
      Alert.alert('Download error', 'Download failed.');
      return;
    }
    await CameraRoll.saveToCameraRoll('file://' + destPath, 'photo');
    Alert.alert('Success', 'Image saved to gallery!');
  } catch (err: any) {
    Alert.alert('Error', err?.message || 'Failed to save image.');
  }
}

const DownloadIcon = ({size = 24, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 16V4m0 12l5-5m-5 5l-5-5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M20 20H4" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const CloseIcon = ({
  size = 18,
  color = '#fff',
}: {
  size?: number;
  color?: string;
}) => (
  <Text
    style={{
      color,
      fontSize: size,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: size,
    }}>
    ✕
  </Text>
);

const RotateIcon = ({size = 24, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 8V4h-4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 12a8 8 0 0 1 14-5.292M20 4v4h-4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

// ==============================
//       MAIN COMPONENT
// ==============================
const ZoomOverlay: React.FC = () => {
  const {visible, source, caption, fallbackTitle, hideOverlay} = useZoomStore();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // --- PINCH ZOOM ---
  const pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 4));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      // when zoomed out, reset pan to zero
      if (scale.value === 1) {
        translateX.value = 0;
        savedTranslateX.value = 0;
        translateY.value = 0;
        savedTranslateY.value = 0;
      }
    });

  // --- PAN DRAG ---
  // (Let pan work only if zoomed!)
  const panGesture = Gesture.Pan()
    .onUpdate(e => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(1);
      savedScale.value = 1;
      rotation.value = withSpring(0);
      savedRotation.value = 0;
      translateX.value = withSpring(0);
      savedTranslateX.value = 0;
      translateY.value = withSpring(0);
      savedTranslateY.value = 0;
    });

  const composedGesture = Gesture.Simultaneous(
    Gesture.Simultaneous(pinchGesture, panGesture),
    doubleTapGesture,
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
      {scale: scale.value},
      {rotate: `${(rotation.value * 180) / Math.PI}deg`},
    ],
  }));

  if (!visible || !source) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <View style={styles.backdrop}>
        <GestureDetector gesture={composedGesture}>
          <Animated.Image
            source={source}
            style={[styles.fullScreenImage, animatedStyle]}
            resizeMode="contain"
          />
        </GestureDetector>
        {/* FAB Buttons */}
        <View style={styles.fabMenu}>
          <TouchableOpacity
            style={[styles.fabButton, styles.fabRotate]}
            onPress={() => {
              rotation.value = withSpring(rotation.value + Math.PI / 2);
              savedRotation.value = rotation.value + Math.PI / 2;
            }}
            activeOpacity={0.85}>
            <RotateIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fabButton, styles.fabDownload]}
            onPress={() =>
              saveImgToGallery(source.uri, caption ?? fallbackTitle)
            }
            activeOpacity={0.8}>
            <DownloadIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fabButton, styles.fabClose]}
            onPress={hideOverlay}
            activeOpacity={0.85}>
            <CloseIcon />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// --- STYLES ---
const FAB_SIZE = 44;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: window.width,
    height: window.height,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  fabMenu: {
    position: 'absolute',
    flexDirection: 'row',
    top: 44,
    right: 22,
    zIndex: 30,
  },
  fabButton: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0,
    backgroundColor: 'rgba(38,42,54,0.93)',
    elevation: 8, // Android drop shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.23,
    shadowRadius: 7,
    marginRight: 12,
  },
  fabDownload: {
    backgroundColor: 'rgba(38,42,54,0.93)',
  },
  fabRotate: {
    backgroundColor: 'rgba(72,132,255,0.93)',
  },
  fabClose: {
    backgroundColor: 'rgba(232,45,66,0.93)',
    marginRight: 0,
  },
});

export default ZoomOverlay;
