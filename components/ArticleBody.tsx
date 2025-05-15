import React from 'react';
import {View, Text, Image, StyleSheet, Dimensions} from 'react-native';
import {ArticleBodyProps} from '@type/types.ts';

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
  highlight: {
    backgroundColor: 'rgba(2,144,234,0.14)',
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

const ArticleBody: React.FC<ArticleBodyProps> = ({items, currentSpokenId}) => (
  <View style={styles.container}>
    {items.map((item, idx) =>
      item.type === 'paragraph' ? (
        <Text
          key={item.id ?? idx}
          style={[
            styles.paragraph,
            currentSpokenId === item.id && styles.highlight,
          ]}>
          {item.text}
        </Text>
      ) : (
        <View key={item.id ?? idx} style={styles.imageContainer}>
          <Image
            source={{uri: item.src}}
            style={styles.image}
            resizeMode="cover"
          />
          {!!item.caption && <Text style={styles.caption}>{item.caption}</Text>}
        </View>
      ),
    )}
  </View>
);

export default ArticleBody;
