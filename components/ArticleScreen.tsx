import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Share,
    Dimensions,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Tts from 'react-native-tts';
import axios from 'axios';
import TTSButton from "@components/TTSButton.tsx";

// --------- TYPES ---------
export type ArticleItem =
    | { type: 'paragraph'; text: string }
    | { type: 'image'; src: string; alt?: string; caption?: string };

// --------- MAIN COMPONENTS ---------
const ArticleScreen: React.FC<any> = ({route, navigation}) => {
    const {item} = route.params;
    const [reading, setReading] = useState(false);
    const [items, setItems] = useState<ArticleItem[] | null>(null);

    const mainImage = item.image || item.enclosure?.['@_url'];

    const onSpeak = async () => {
        Tts.stop();
        setReading(true);
        await Tts.speak(
            item.title +
            '. ' +
            (removeTags(item.description) || removeTags(item.content) || '')
        );
        setReading(false);
    };

    const onStop = () => {
        Tts.stop();
        setReading(false);
    };

    const onShare = async () => {
        try {
            await Share.share({
                message: `${item.title}\n\nĐọc bài tại: ${item.link || item.url || ''}`,
                url: item.link,
                title: item.title,
            });
        } catch (e) {
        }
    };

    useEffect(() => {
        (async () => {
            let result: string | null = null;
            try {
                const res = await axios.get(item.link);
                result = res.data;
            } catch (e) {
                console.error(e);
            }
            if (!result) return;
            const contentItems = extractOrderedArticleContent(result);
            if (contentItems?.length) setItems(contentItems);
        })();
    }, [item.link]);

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={28} color="#fff"/>
                </TouchableOpacity>
                <Text style={styles.heading} numberOfLines={1}>
                    Chi tiết
                </Text>
                <TouchableOpacity onPress={onShare}>
                    <Icon name="share-variant" size={25} color="#fff"/>
                </TouchableOpacity>
            </View>

            <ScrollView style={{flex: 1}} contentContainerStyle={{paddingBottom: 40}}>
                {mainImage ? (
                    <Image source={{uri: mainImage}} style={styles.image} resizeMode="cover"/>
                ) : (
                    <View style={styles.noImage}>
                        <Icon name="image" size={60} color="#ccc"/>
                    </View>
                )}

                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.meta}>
                    <Text style={styles.source}>{item.source}</Text>
                    {item.time && <Text style={styles.time}>{item.time}</Text>}
                </View>

                {items?.length ? (
                    <ArticleBody items={items}/>
                ) : item.description ? (
                    <Text style={styles.desc}>{removeTags(item.description)}</Text>
                ) : null}

                {item.content ? (
                    <Text style={styles.content}>{removeTags(item.content)}</Text>
                ) : null}

                {(item.link || item.url) && (
                    <TouchableOpacity
                        style={styles.linkBtn}
                        onPress={() => Linking.openURL(item.link || item.url)}
                    >
                        <Icon name="open-in-new" size={18} color="#039ed8"/>
                        <Text style={styles.linkText}>Đọc bản đầy đủ trên web</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* TTS Controls */}
            <View style={styles.ttsBar}>
                <TTSButton
                    reading={reading}
                    onSpeak={() => setReading(true)}
                    onStop={() => setReading(false)}
                />
            </View>
        </SafeAreaView>
    );
};

// Separated body renderer for clarity
const ArticleBody: React.FC<{ items: ArticleItem[] }> = ({items}) => (
    <View style={{padding: 16}}>
        {items.map((item, idx) =>
            item.type === 'paragraph' ? (
                <Text
                    key={idx}
                    style={{
                        fontSize: 17,
                        marginBottom: 15,
                        color: '#222',
                        lineHeight: 26,
                    }}
                >
                    {item.text}
                </Text>
            ) : (
                <View key={idx} style={{alignItems: 'center', marginBottom: 18}}>
                    <Image
                        source={{uri: item.src}}
                        style={{
                            width: Dimensions.get('window').width - 40,
                            height: 200,
                            backgroundColor: '#eee',
                            borderRadius: 12,
                        }}
                        resizeMode="cover"
                    />
                    {!!item.caption && (
                        <Text
                            style={{
                                color: '#888',
                                fontSize: 14,
                                marginTop: 6,
                                fontStyle: 'italic',
                                textAlign: 'center',
                            }}
                        >
                            {item.caption}
                        </Text>
                    )}
                </View>
            )
        )}
    </View>
);

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#039ed8',
        paddingHorizontal: 10,
        height: 50,
    },
    heading: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        flex: 1,
        textAlign: 'center',
    },
    image: {
        width: '100%',
        height: 220,
        backgroundColor: '#f5f5f5',
    },
    noImage: {
        width: '100%',
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee',
    },
    title: {
        fontSize: 23,
        fontWeight: '600',
        padding: 12,
        paddingBottom: 2,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    source: {
        color: '#c50000',
        fontWeight: 'bold',
        marginRight: 10,
    },
    time: {
        color: '#888',
    },
    desc: {
        fontSize: 17,
        margin: 12,
        color: '#222',
    },
    content: {
        fontSize: 16,
        color: '#333',
        marginHorizontal: 12,
        marginBottom: 7,
    },
    linkBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        marginVertical: 16,
    },
    linkText: {
        color: '#039ed8',
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 6,
        textDecorationLine: 'underline',
    },
    ttsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    ttsBtn: {
        backgroundColor: '#F5FAFD',
        borderRadius: 18,
        paddingHorizontal: 24,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    ttsTxt: {
        marginLeft: 9,
        color: '#039ed8',
        fontWeight: '700',
        fontSize: 16,
    },
});

// --------- HELPERS ----------
function removeTags(str?: string): string {
    return str ? str.replace(/<[^>]+>/g, '') : '';
}

function isSvgUrl(url: string): boolean {
    if (!url) return false;
    if (url.startsWith('data:image/svg')) return true;
    const cleaned = url.split('?')[0].split('#')[0];
    return cleaned.toLowerCase().endsWith('.svg');
}

/**
 * Given a data-srcset or srcset string, returns the best (highest res) image URL.
 * "Best" is usually the last in the list.
 */
function pickBestSrcset(srcset: string): string | null {
    if (!srcset) return null;
    const urls = srcset
        .split(',')
        .map((s) => s.trim())
        .filter((s) => !!s);
    if (urls.length === 0) return null;
    const last = urls[urls.length - 1];
    const url = last.split(' ')[0];
    return url;
}

/** Picks the preferred image URL from a block of HTML (figure, picture, or standalone img) */
function pickImageUrlFromBlock(block: string): string | null {
    // 1. Look for <source data-srcset="...">
    const sourceMatch = block.match(/<source[^>]+data-srcset=['"]([^'"]+)['"]/i);
    if (sourceMatch) {
        const best = pickBestSrcset(sourceMatch[1]);
        if (best && !isSvgUrl(best)) return best;
    }
    // fallback <img ... src="...">
    const imgMatch = block.match(/<img[^>]+src=['"]([^'"]+)['"]/i);
    if (imgMatch && !isSvgUrl(imgMatch[1])) {
        const src = imgMatch[1];
        if (!src.startsWith('data:image/gif;base64,R0lGODlhAQABAAAAA')) return src;
    }
    return null;
}

/**
 * Extracts ordered paragraphs and images from article HTML.
 * - Ignores SVG and invisible 1x1 GIFs.
 * - Handles <source data-srcset="..."> inside <figure>/<picture>
 */
export function extractOrderedArticleContent(html: string): ArticleItem[] {
    if (!html) return [];
    const result: ArticleItem[] = [];
    // Fixed: [^>]*
    const regex =
        /<p\b[^>]*>[\s\S]*?<\/p>|<figure\b[^>]*>[\s\S]*?<\/figure>|<picture\b[^>]*>[\s\S]*?<\/picture>|<img[\s\S]*?>/gi;
    let match;
    while ((match = regex.exec(html))) {
        const str = match[0];
        if (/^<p\b/i.test(str)) {
            const text = str.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
            if (text) result.push({type: 'paragraph', text});
        } else if (/^<figure\b/i.test(str)) {
            const src = pickImageUrlFromBlock(str);
            const imgMatch = str.match(/<img[^>]+alt=['"]([^'"]*)['"]/i);
            const alt = imgMatch ? imgMatch[1] : '';
            const captionMatch = str.match(/<figcaption[^>]*>([\s\S]+?)<\/figcaption>/i);
            const caption = captionMatch ? captionMatch[1].replace(/<[^>]+>/g, '').trim() : '';
            if (src && !isSvgUrl(src)) result.push({type: 'image', src, alt, caption});
        } else if (/^<picture\b/i.test(str)) {
            const src = pickImageUrlFromBlock(str);
            const imgMatch = str.match(/<img[^>]+alt=['"]([^'"]*)['"]/i);
            const alt = imgMatch ? imgMatch[1] : '';
            if (src && !isSvgUrl(src)) result.push({type: 'image', src, alt});
        } else if (/^<img\b/i.test(str)) {
            const src = pickImageUrlFromBlock(str);
            const altMatch = str.match(/alt=['"]([^'"]*)['"]/i);
            const alt = altMatch ? altMatch[1] : '';
            if (src && !isSvgUrl(src)) result.push({type: 'image', src, alt});
        }
    }
    return result;
}

export default ArticleScreen;
