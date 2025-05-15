import React, {useState} from 'react';
import {View, Dimensions, TouchableOpacity, StyleSheet} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

const {width, height} = Dimensions.get('window');

export default function TestPseudoModalZoom() {
  const [open, setOpen] = useState(false);

  // Setup for zoom
  const scale = useSharedValue(1);
  const pinch = Gesture.Pinch()
    .onUpdate(e => {
      console.log('PINCH', e.scale);
      scale.value = Math.max(1, Math.min(e.scale, 4));
    })
    .onEnd(() => {});

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    backgroundColor: 'blue',
  }));

  return (
    <View style={{flex: 1}}>
      {/* Thumbnail or trigger */}
      <TouchableOpacity onPress={() => setOpen(true)}>
        <View
          style={{width: 100, height: 70, backgroundColor: 'grey', margin: 40}}
        />
      </TouchableOpacity>

      {/* "Modal" overlay */}
      {open && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={[styles.backdrop]}>
            <GestureDetector gesture={pinch}>
              <Animated.View
                style={[{width: width - 80, height: height / 3}, animatedStyle]}
              />
            </GestureDetector>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setOpen(false)}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#fff',
                  borderRadius: 20,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 32,
    right: 16,
    padding: 10,
    zIndex: 20,
  },
});
