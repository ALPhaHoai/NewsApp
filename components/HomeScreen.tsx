import React, {useEffect, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Tts from 'react-native-tts';

import {fetchRssData} from '../utils/rss';
import {getAllNews, initNewsTable, insertNewsBatch, openDB} from '../db';
import {NewsItemType} from '@type/types.ts';

import NewsSectionTabs from './NewsSectionTabs';
import NewsItem from './NewsItem';
import BottomNavigationBar from './BottomNavigationBar';
import useStore from '@store/useStore.ts';

const rssLinks = [
  'https://vnexpress.net/rss/tin-moi-nhat.rss',
  'https://vnexpress.net/rss/the-gioi.rss',
  'https://vnexpress.net/rss/thoi-su.rss',
  'https://vnexpress.net/rss/kinh-doanh.rss',
  'https://vnexpress.net/rss/startup.rss',
  'https://vnexpress.net/rss/giai-tri.rss',
  'https://vnexpress.net/rss/the-thao.rss',
  'https://vnexpress.net/rss/phap-luat.rss',
  'https://vnexpress.net/rss/giao-duc.rss',
  'https://vnexpress.net/rss/tin-moi-nhat.rss',
  'https://vnexpress.net/rss/tin-noi-bat.rss',
  'https://vnexpress.net/rss/suc-khoe.rss',
  'https://vnexpress.net/rss/gia-dinh.rss',
  'https://vnexpress.net/rss/du-lich.rss',
  'https://vnexpress.net/rss/khoa-hoc-cong-nghe.rss',
  'https://vnexpress.net/rss/oto-xe-may.rss',
  'https://vnexpress.net/rss/y-kien.rss',
  'https://vnexpress.net/rss/tam-su.rss',
  'https://vnexpress.net/rss/cuoi.rss',
  'https://vnexpress.net/rss/tin-xem-nhieu.rss',
];

const separator = () => <View style={styles.separator} />;

// Receive navigation prop from react-navigation
const HomeScreen = ({navigation}) => {
  const data = useStore(state => state.data);
  const setData = useStore(state => state.setData);
  const homeLoading = useStore(state => state.homeLoading);
  const setHomeLoading = useStore(state => state.setHomeLoading);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const arrOfArr = await Promise.all(rssLinks.map(fetchRssData));
      let allNews = arrOfArr.flatMap(news => news.items);
      allNews = allNews.sort((a, b) => (b.time || 0) - (a.time || 0));
      const seen = new Set<number>();
      allNews = allNews.filter(item => {
        if (!item.id) {
          return false;
        }
        if (seen.has(item.id)) {
          return false;
        }
        seen.add(item.id);
        return true;
      });
      await insertNewsBatch(allNews);
      setData(allNews);
    } catch (e) {}
    setRefreshing(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const arrOfArr = await Promise.all(rssLinks.map(fetchRssData));
        let allNews = arrOfArr.flatMap(news => news.items);
        allNews = allNews.sort((a, b) => (b.time || 0) - (a.time || 0));
        const seen = new Set<number>();
        allNews = allNews.filter(item => {
          if (!item.id) {
            return false;
          }
          if (seen.has(item.id)) {
            return false;
          }
          seen.add(item.id);
          return true;
        });

        const newsArray: NewsItemType[] = allNews.map(function (item) {
          return {
            ...item,
            id: item.id,
            title: item.title,
            image: item.image || item.enclosure?.['@_url'],
            source: item.source,
            time: item.time,
            link: item.link || item.guid,
            description: item.description,
          };
        });
        await insertNewsBatch(newsArray);
        setData(newsArray);
      } catch (_) {}
      setHomeLoading(false);
    })();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#039ed8" barStyle="light-content" />
      {/* Top Navigation */}
      <View style={styles.topBar}>
        <Icon name="menu" size={28} color="#fff" />
        <NewsSectionTabs />
        <Icon name="magnify" size={28} color="#fff" />
        <Icon name="account-circle-outline" size={28} color="#fff" />
      </View>
      {/* News List */}
      {homeLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{paddingBottom: 80}}
          data={data}
          renderItem={({item}) => (
            <NewsItem
              item={item}
              onPress={() =>
                navigation.navigate('ArticleScreen', {article: item})
              }
            />
          )}
          keyExtractor={item => item.id.toString()}
          ItemSeparatorComponent={separator}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
      {/* Bottom Navigation */}
      <BottomNavigationBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#039ed8',
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  separator: {
    height: 1,
    backgroundColor: '#f2f2f2',
    marginLeft: 12,
    marginRight: 12,
  },
});

export default HomeScreen;
