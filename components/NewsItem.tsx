import React, {memo} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet, ImageStyle, ViewStyle} from 'react-native';
import Tts from 'react-native-tts';
import Svg, {Rect, Path, Circle} from 'react-native-svg';
import {NewsItemType} from '../types';

type Props = {
    item: NewsItemType;
};

const DefaultNewsSvg = () => (
    <Svg width={100} height={80} viewBox="0 0 100 80">
        <Rect x="5" y="10" width="90" height="60" rx="10" fill="#e0e0e0"/>
        <Rect x="15" y="20" width="40" height="10" rx="2" fill="#c0c0c0"/>
        <Rect x="15" y="35" width="70" height="10" rx="2" fill="#c0c0c0"/>
        <Rect x="15" y="50" width="60" height="8" rx="2" fill="#d0d0d0"/>
        <Circle cx="82" cy="25" r="6" fill="#b0b0b0"/>
    </Svg>
);

const NewsItem: React.FC<Props> = ({item}) => {
    const onPress = () => {
        Tts.stop();
        Tts.speak(item.title);
    };

    // Supports enclosure?.@_url as fallback for RSS feeds
    const mainImage = item.image || item.enclosure?.['@_url'];

    const renderImage = () => {
        if (Array.isArray(item.images) && item.images.length) {
            return (
                <View style={styles.imagesRow}>
                    {item.images.map((img, idx) => (
                        <Image
                            key={idx}
                            source={{uri: img}}
                            style={styles.multiImage}
                            resizeMode="cover"
                        />
                    ))}
                </View>
            );
        }
        if (mainImage) {
            return (
                <Image
                    source={{uri: mainImage}}
                    style={styles.newsImage}
                    resizeMode="cover"
                />
            );
        }
        return (
            <View style={styles.newsImage}>
                <DefaultNewsSvg/>
            </View>
        );
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <View style={styles.newsItem}>
                {renderImage()}
                <View style={{flex: 1}}>
                    <Text style={styles.newsTitle}>{item.title}</Text>
                    <View style={styles.newsMeta}>
                        <Text style={styles.newsSource}>{item.source}</Text>
                        <Text style={styles.newsTime}>{item.time ? ` · ${item.time}` : ''}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    newsItem: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#fff',
        alignItems: 'flex-start',
    } as ViewStyle,
    newsImage: {
        width: 100,
        height: 80,
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    } as ImageStyle,
    imagesRow: {
        flexDirection: 'row',
        marginRight: 10,
    } as ViewStyle,
    multiImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 6,
        backgroundColor: '#e0e0e0',
    } as ImageStyle,
    newsTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 8,
    },
    newsMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    newsSource: {
        color: '#c50000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    newsTime: {
        color: '#888',
        fontSize: 13,
        marginLeft: 4,
    },
});

export default memo(NewsItem);
