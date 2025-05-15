import React, { useState } from 'react';
import { Modal, TouchableOpacity, View, StyleSheet, Dimensions, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function TestModalZoom() {
  const [visible, setVisible] = useState(true); // open by default
  const scale = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .onUpdate(e => {
      console.log('PINCH', e.scale);
      scale.value = Math.max(1, Math.min(e.scale, 4));
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: 'blue',
  }));

  return (
    <Modal visible={visible} transparent>
      <View style={styles.backdrop}>
        <GestureDetector gesture={pinch}>
          <Animated.View style={[{ width: width - 80, height: height / 3 }, animatedStyle]} />
        </GestureDetector>
        <TouchableOpacity style={styles.closeButton} onPress={() => setVisible(false)}>
          <Text style={{color: 'white', fontSize: 28}}>✕</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0, 0.9)',
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
