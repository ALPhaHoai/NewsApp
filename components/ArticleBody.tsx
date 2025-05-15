import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ArticleBodyProps, ArticleBodyRef} from '@type/types.ts';
import ImageWithZoomAndDownload from '@components/ImageWithZoomAndDownload.tsx';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {padding: 16},
  paragraph: {
    fontSize: 17,
    marginBottom: 15,
    color: '#222',
    lineHeight: 26,
    backgroundColor: 'transparent',
  },
  paragraphHighlight: {
    backgroundColor: 'rgba(2,144,234,0.06)',
  },
  highlight: {
    backgroundColor: 'rgba(2,144,234,0.14)',
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  image: {
    width: width - 20,
    minHeight: 200,
    height: '100%',
    backgroundColor: '#eee',
    borderRadius: 12,
  },
  caption: {
    color: '#888',
    fontSize: 14,
    marginTop: 6,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

type ParagraphLayout = {y: number; height: number};

const ArticleBody = forwardRef<ArticleBodyRef, ArticleBodyProps>(
  ({article, items, currentSpokenId, currentSpokenSubTextId}, ref) => {
    const scrollViewRef = useRef<ScrollView>(null);

    // Map: paragraph id -> {y, height}
    const paragraphLayoutMap = useRef(new Map<string, ParagraphLayout>());

    // Current visible top and bottom in scrollview
    const [scrollState, setScrollState] = useState({y: 0, viewportHeight: 0});

    // Capture scroll position and visible height
    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setScrollState({
        y: e.nativeEvent.contentOffset.y,
        viewportHeight: e.nativeEvent.layoutMeasurement.height,
      });
    };

    useImperativeHandle(ref, () => ({
      scrollToSubText: (itemId: string, _subTextId: string) => {
        const layout = paragraphLayoutMap.current.get(itemId);
        if (!layout) {
          return;
        }
        const paraTop = layout.y;
        const paraBottom = layout.y + layout.height;
        const viewTop = scrollState.y;
        const viewBottom = scrollState.y + scrollState.viewportHeight;
        const isVisible = paraBottom > viewTop && paraTop < viewBottom;
        if (!isVisible) {
          scrollViewRef.current?.scrollTo({
            y: Math.max(paraTop - 40, 0),
            animated: true,
          });
        }
      },
    }));

    return (
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        onScroll={handleScroll}
        onLayout={e =>
          setScrollState(state => ({
            ...state,
            viewportHeight: e.nativeEvent?.layout?.height,
          }))
        }
        scrollEventThrottle={16}>
        {items.map((item, idx) =>
          item.type === 'paragraph' ? (
            <Text
              key={item.id ?? idx}
              onLayout={e => {
                paragraphLayoutMap.current.set(item.id, {
                  y: e.nativeEvent.layout.y,
                  height: e.nativeEvent.layout.height,
                });
              }}
              style={[
                styles.paragraph,
                currentSpokenId === item.id && styles.paragraphHighlight,
              ]}>
              {(item.subTexts ?? [{text: item.text, id: item.id}]).map(
                (sub, i, arr) => {
                  const isCurrent =
                    currentSpokenId === item.id &&
                    currentSpokenSubTextId === sub.id;
                  return (
                    <Text
                      key={sub.id}
                      style={isCurrent ? styles.highlight : undefined}
                      suppressHighlighting={true}>
                      {sub.text + (i < arr.length - 1 ? ', ' : '')}
                    </Text>
                  );
                },
              )}
            </Text>
          ) : (
            <View key={item.id ?? idx} style={styles.imageContainer}>
              <ImageWithZoomAndDownload
                source={{uri: item.src}}
                style={styles.image}
                resizeMode="contain"
                fallbackTitle={article.title}
                caption={item.caption}
              />
              {!!item.caption && (
                <Text style={styles.caption}>{item.caption}</Text>
              )}
            </View>
          ),
        )}
      </ScrollView>
    );
  },
);

export default ArticleBody;
