import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Linking,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Tts from 'react-native-tts';
import axios from 'axios';
import TTSButton from '@components/TTSButton.tsx';
import ArticleBody from '@components/ArticleBody.tsx';
import {
  ArticleBodyRef,
  ArticleBodyItem,
  ImageItem,
  ParagraphItem,
  ParagraphSubText,
  ParsedVnExpressArticle,
} from '@type/types.ts';
import moment from 'moment';
import {parseVnExpress} from '../parser/vneParser.ts';

const PAUSE_MS = 1100;

// --------- MAIN COMPONENTS ---------
const ArticleScreen: React.FC<any> = ({route, navigation}) => {
  const {article} = route.params;
  const [reading, setReading] = useState(false);
  const [loading, setLoading] = useState(false);
  const readingRef = useRef(reading);
  const [bodyItems, setBodyItems] = useState<ArticleBodyItem[] | null>(null);
  const [currentSpokenId, setCurrentSpokenId] = useState<string | null>(null);
  const [currentSpokenSubTextId, setCurrentSpokenSubTextId] = useState<
    string | null
  >(null);
  const articleBodyRef = useRef<ArticleBodyRef>(null);

  const time = article.time;

  const mainImage = article.image || article.enclosure?.['@_url'];

  useEffect(() => {
    readingRef.current = reading;
  }, [reading]);

  const onSpeak = async () => {
    if (!bodyItems) {
      return;
    }

    const speakableItems: ParagraphItem[] = [
      ...bodyItems.filter(isParagraph).map(i => ({
        ...i,
        id: i.id!,
        text: i.text,
        type: 'paragraph' as const,
      })),
    ].filter(i => i.text);

    if (!speakableItems.length) {
      return;
    }

    await Tts.stop();
    setReading(true);
    readingRef.current = true;

    let idx = 0;

    const speakNext = async () => {
      if (!readingRef.current) {
        await Tts.stop();
        Tts.removeAllListeners('tts-finish');
        setReading(false);
        setCurrentSpokenId(null);
        setCurrentSpokenSubTextId(null);
        return;
      }

      if (idx < speakableItems.length) {
        setCurrentSpokenId(speakableItems[idx].id);

        const subTexts = speakableItems[idx].subTexts || [];
        let subIdx = 0;

        const speakSubNext = async () => {
          if (!readingRef.current || subIdx >= subTexts.length) {
            setCurrentSpokenSubTextId(null);
            return;
          }
          const subText = subTexts[subIdx];
          setCurrentSpokenSubTextId(subText.id);

          // SCROLL to subtext in ArticleBody
          articleBodyRef.current?.scrollToSubText(
            speakableItems[idx].id,
            subText.id,
          );

          Tts.speak(subText.text);
        };

        const subFinish = () => {
          subIdx++;
          if (subIdx < subTexts.length) {
            setTimeout(speakSubNext, 200);
          } else {
            Tts.removeAllListeners('tts-finish');
            setCurrentSpokenSubTextId(null);
            idx++;
            setTimeout(speakNext, PAUSE_MS);
          }
        };

        Tts.removeAllListeners('tts-finish');
        Tts.addEventListener('tts-finish', subFinish);
        await speakSubNext();
      } else {
        Tts.removeAllListeners('tts-finish');
        setReading(false);
        setCurrentSpokenId(null);
        setCurrentSpokenSubTextId(null);
      }
    };

    await speakNext();
  };

  const onStop = () => {
    Tts.stop();
    setReading(false);
    Tts.removeAllListeners('tts-finish');
    setCurrentSpokenId(null);
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\nĐọc bài tại: ${
          article.link || article.url || ''
        }`,
        url: article.link,
        title: article.title,
      });
    } catch (e) {}
  };

  useEffect(() => {
    (async () => {
      console.log('Fetching article:', article.link);
      setLoading(true);
      let result: string | null = null;
      try {
        const res = await axios.get(article.link);
        result = res.data;
        console.log('Successfully fetched data. Data length:', result?.length);
      } catch (e) {
        console.error('Error fetching article:', e);
      }
      setLoading(false);

      if (!result) {
        console.log('No article content returned. (result is null or empty)');
        return;
      }

      console.log('Parsing article...');
      const articleDetail = parseVnExpress(result);
      console.log('Parsed article detail:', articleDetail);

      if (articleDetail) {
        console.log('Preprocessing items...');
        preprocessItems(articleDetail);
        setBodyItems(articleDetail.content);
        console.log('Set bodyItems, total:', articleDetail.content?.length);
      } else {
        console.log('Parsing failed: articleDetail is null');
      }
    })();
  }, [article.link]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      {/* LOADING OVERLAY */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#039ed8" />
        </View>
      )}

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.heading} numberOfLines={1}>
          Chi tiết
        </Text>
        <TouchableOpacity onPress={onShare}>
          <Icon name="share-variant" size={25} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{flex: 1}} contentContainerStyle={{paddingBottom: 40}}>
        {mainImage ? (
          <Image
            source={{uri: mainImage}}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImage}>
            <Icon name="image" size={60} color="#ccc" />
          </View>
        )}

        <Text style={styles.title}>{article.title}</Text>
        <View style={styles.meta}>
          <Text style={styles.source}>{article.source}</Text>
          {time && <Text style={styles.time}>{moment(time).toString()}</Text>}
        </View>

        {bodyItems?.length ? (
          <ArticleBody
            ref={articleBodyRef}
            items={bodyItems}
            currentSpokenId={currentSpokenId}
            currentSpokenSubTextId={currentSpokenSubTextId}
            article={article}
          />
        ) : article.description ? (
          <Text style={styles.desc}>{removeTags(article.description)}</Text>
        ) : null}

        {article.content ? (
          <Text style={styles.content}>{removeTags(article.content)}</Text>
        ) : null}

        {(article.link || article.url) && (
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => Linking.openURL(article.link || article.url)}>
            <Icon name="open-in-new" size={18} color="#039ed8" />
            <Text style={styles.linkText}>Đọc bản đầy đủ trên web</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* TTS Controls */}
      <View style={styles.ttsBar}>
        <TTSButton reading={reading} onSpeak={onSpeak} onStop={onStop} />
      </View>
    </SafeAreaView>
  );
};

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
  // LOADING OVERLAY ADDED HERE
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

// --------- HELPERS ----------
function removeTags(str?: string): string {
  return str ? str.replace(/<[^>]+>/g, '') : '';
}

export function isParagraph(item: ArticleBodyItem): item is ParagraphItem {
  return item.type === 'paragraph';
}

export function isImage(item: ArticleBodyItem): item is ImageItem {
  return item.type === 'image';
}

export function preprocessItems(articleDetail: ParsedVnExpressArticle) {
  let subCount = 1;

  articleDetail.content?.forEach(item => {
    if (item.type === 'paragraph') {
      item.subTexts = item.text
        .split(/[,.]/)
        .map(s => ({
          text: s.trim(),
          id: (subCount++).toString(),
        }))
        .filter(sub => sub.text); // remove any empty splits
    }
  });
}

export default ArticleScreen;
