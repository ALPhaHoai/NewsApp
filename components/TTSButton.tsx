import React, {useRef, useEffect} from 'react';
import {TouchableOpacity, Text, StyleSheet, Animated, ViewStyle} from 'react-native';
import Svg, {Path, Rect} from 'react-native-svg';

export const VolumeIcon: React.FC<{ size?: number; color?: string }> = ({size = 22, color = '#039ed8'}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 9v6h4l5 5V4l-5 5H3z" fill={color}/>
        <Path d="M16 8.82v6.36M19 7v10" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    </Svg>
);

export const StopIcon: React.FC<{ size?: number; color?: string }> = ({size = 22, color = '#d41515'}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x={4} y={4} width={16} height={16} rx={3} fill={color}/>
    </Svg>
);

interface TTSButtonProps {
    reading: boolean;
    onSpeak: () => void;
    onStop: () => void;
    style?: ViewStyle;
}

const TTSButton: React.FC<TTSButtonProps> = ({
                                                 reading,
                                                 onSpeak,
                                                 onStop,
                                                 style,
                                             }) => {
    // Animation value
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        let pulse: Animated.CompositeAnimation | undefined;
        if (reading) {
            pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(scale, {
                        toValue: 1.08,
                        duration: 450,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scale, {
                        toValue: 1,
                        duration: 450,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();
        } else {
            scale.stopAnimation();
            scale.setValue(1);
        }
        return () => {
            pulse && pulse.stop();
            scale.setValue(1);
        };
    }, [reading, scale]);

    return (
        <Animated.View style={{transform: [{scale}], alignSelf: 'flex-start'}}>
            {!reading ? (
                <TouchableOpacity
                    style={[styles.ttsBtn, style]}
                    onPress={onSpeak}
                    accessibilityRole="button"
                    accessibilityLabel="Speak article. Button to listen to this article."
                    accessibilityHint="Plays audio of the article"
                    activeOpacity={0.7}
                >
                    <VolumeIcon size={22} color="#039ed8"/>
                    <Text style={styles.ttsTxt}>Đọc tin</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={[
                        styles.ttsBtn,
                        {backgroundColor: '#EAEDF0'},
                        style,
                    ]}
                    onPress={onStop}
                    accessibilityRole="button"
                    accessibilityLabel="Stop speaking. Button to stop article audio."
                    accessibilityHint="Stops the audio of the article"
                    activeOpacity={0.7}
                >
                    <StopIcon size={22} color="#d41515"/>
                    <Text style={[styles.ttsTxt, {color: '#d41515'}]}>Dừng</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    ttsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 24,
        paddingVertical: 8,
        paddingHorizontal: 18,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 2,
        elevation: 1,
    },
    ttsTxt: {
        marginLeft: 8,
        fontSize: 15,
        color: '#039ed8',
        fontWeight: '600',
    },
});

export default TTSButton;
