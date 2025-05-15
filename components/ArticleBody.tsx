import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  findNodeHandle,
  ScrollView,
} from 'react-native';
import {ArticleBodyProps, ArticleBodyRef} from '@type/types.ts';

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  paragraph: {
    fontSize: 17,
    marginBottom: 15,
    color: '#222',
    lineHeight: 26,
    backgroundColor: 'transparent',
  },
  paragraphHighlight: {
    backgroundColor: 'rgba(2,144,234,0.06)', // softer, less attractive
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
    width: windowWidth - 40,
    height: 200,
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

const ArticleBody = forwardRef<ArticleBodyRef, ArticleBodyProps>(
  ({items, currentSpokenId, currentSpokenSubTextId}, ref) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const subTextRefs = useRef<Map<string, Text>>(new Map());

    // Expose scrollToSubText method to parent via ref
    useImperativeHandle(ref, () => ({
      scrollToSubText: (itemId, subTextId) => {
        // key format: "${itemId}_${subTextId}"
        const refKey = `${itemId}_${subTextId}`;
        const textRef = subTextRefs.current.get(refKey);
        if (!textRef || !scrollViewRef.current) {
          return;
        }
        (textRef as any).measureLayout(
          findNodeHandle(scrollViewRef.current),
          (x: number, y: number) => {
            scrollViewRef.current?.scrollTo({
              y: Math.max(y - 40, 0),
              animated: true,
            });
          },
        );
      },
    }));

    return (
      <ScrollView ref={scrollViewRef} style={styles.container}>
        {items.map((item, idx) =>
          item.type === 'paragraph' ? (
            <Text
              key={item.id ?? idx}
              style={[
                styles.paragraph,
                currentSpokenId === item.id && styles.paragraphHighlight,
              ]}>
              {(item.subTexts ?? [{text: item.text, id: item.id}]).map(
                (sub, i, arr) => {
                  const refKey = `${item.id}_${sub.id}`;
                  const isCurrent =
                    currentSpokenId === item.id &&
                    currentSpokenSubTextId === sub.id;
                  return (
                    <Text
                      key={sub.id}
                      ref={el => {
                        if (el) {
                          subTextRefs.current.set(refKey, el);
                        }
                      }}
                      style={[isCurrent && styles.highlight]}>
                      {sub.text + (i < arr.length - 1 ? ', ' : '')}
                    </Text>
                  );
                },
              )}
            </Text>
          ) : (
            <View key={item.id ?? idx} style={styles.imageContainer}>
              <Image
                source={{uri: item.src}}
                style={styles.image}
                resizeMode="cover"
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
