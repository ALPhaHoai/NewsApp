import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Svg, {Path, Rect, Circle} from 'react-native-svg';
import useNavigationStore from "@store/useNavigationStore.ts";

// SVG ICONS
const NewsIcon = ({color}: { color: string }) => (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
        <Path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a1 1 0 0 1-2 0V7a2 2 0 0 0-2-2H5a1 1 0 0 1-2 0V5z" stroke={color}
              strokeWidth={2} fill="none"/>
        <Rect x={6} y={9} width={7} height={2} rx={1} fill={color}/>
        <Rect x={6} y={13} width={5} height={2} rx={1} fill={color}/>
        <Rect x={15} y={13} width={3} height={3} rx={1} fill={color}/>
    </Svg>
);

const VideoIcon = ({color}: { color: string }) => (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
        <Rect x={3} y={5} width={15} height={14} rx={2} stroke={color} strokeWidth={2} fill="none"/>
        <Path d="M21 7.5v9l-4-3v-3l4-3z" fill={color}/>
    </Svg>
);

const TrendingIcon = ({color}: { color: string }) => (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
        <Path d="M3 17l6-6 4 4 7-7" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round"
              strokeLinejoin="round"/>
        <Circle cx={21} cy={8} r={1.5} fill={color}/>
    </Svg>
);

const GridIcon = ({color}: { color: string }) => (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
        <Rect x={3} y={3} width={7} height={7} rx={2} stroke={color} fill="none" strokeWidth={2}/>
        <Rect x={14} y={3} width={7} height={7} rx={2} stroke={color} fill="none" strokeWidth={2}/>
        <Rect x={14} y={14} width={7} height={7} rx={2} stroke={color} fill="none" strokeWidth={2}/>
        <Rect x={3} y={14} width={7} height={7} rx={2} stroke={color} fill="none" strokeWidth={2}/>
    </Svg>
);

type TabType = {
    label: string;
    Icon: React.ComponentType<{ color: string }>;
};

const TABS: TabType[] = [
    {label: 'Tin tức', Icon: NewsIcon},
    {label: 'Video', Icon: VideoIcon},
    {label: 'Xu hướng', Icon: TrendingIcon},
    {label: 'Tiện ích', Icon: GridIcon},
];

type BottomNavigationBarProps = {
    initialTabIndex?: number;
    onTabPress?: (index: number) => void;
};

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
                                                                     initialTabIndex = 0,
                                                                     onTabPress,
                                                                 }) => {
    const activeTab = useNavigationStore(s => s.activeTab);
    const setActiveTab = useNavigationStore(s => s.setActiveTab);

    const handleTabPress = (index: number) => {
        setActiveTab(index);
        if (onTabPress) onTabPress(index);
    };

    return (
        <View style={styles.bottomTabs}>
            {TABS.map((tab, idx) => {
                const isActive = idx === activeTab;
                const color = isActive ? '#00b1b2' : '#888';
                return (
                    <TouchableOpacity
                        key={tab.label}
                        style={isActive ? styles.bottomTabActive : styles.bottomTab}
                        onPress={() => handleTabPress(idx)}
                        activeOpacity={0.6}
                    >
                        <tab.Icon color={color}/>
                        <Text style={isActive ? styles.bottomTabLabelActive : styles.bottomTabLabel}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    bottomTabs: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        borderTopColor: '#e0e0e0',
        borderTopWidth: 1,
        paddingVertical: 8,
    },
    bottomTab: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    bottomTabActive: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    bottomTabLabel: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    bottomTabLabelActive: {
        fontSize: 13,
        color: '#00b1b2',
        marginTop: 2,
        fontWeight: 'bold',
    },
});

export default BottomNavigationBar;
