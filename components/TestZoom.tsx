import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function TestZoom() {
  const scale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      console.log('PINCH', e.scale);
      scale.value = Math.max(1, Math.min(e.scale, 4));
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: 'blue',
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pinchGesture}>
        <Animated.View style={[{ width: width - 80, height: height / 3 }, animatedStyle]} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
});
