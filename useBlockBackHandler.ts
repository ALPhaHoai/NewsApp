import {useEffect} from 'react';
import {BackHandler} from 'react-native';

/**
 * Blocks the hardware back button while `enabled` is true.
 * Optionally, runs `onBack` when back is pressed and returns true to block.
 */
export function useBlockBackHandler(enabled: boolean, onBack?: () => void) {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handler = () => {
      if (onBack) {
        onBack();
      }
      return true; // blocks the back action
    };
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handler,
    );
    return () => subscription.remove();
  }, [enabled, onBack]);
}
