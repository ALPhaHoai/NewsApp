import SQLite from 'react-native-sqlite-storage';
import {NewsItemType} from '@type/types.ts';

let db: SQLite.SQLiteDatabase | null = null;
const TABLE_NAME = 'news';

export const openDB = () =>
  new Promise<SQLite.SQLiteDatabase>((resolve, reject) => {
    db = SQLite.openDatabase(
      {name: 'News.db', location: 'default'},
      () => {
        resolve(db!);
      },
      error => {
        console.log('DB open error:', error);
        reject(error);
      },
    );
  });

export const initNewsTable = (): Promise<void> =>
  new Promise((resolve, reject) => {
    db!.transaction(
      tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ${TABLE_NAME}
           (
             id          INTEGER PRIMARY KEY NOT NULL,
             title       TEXT,
             image       TEXT,
             source      TEXT,
             time        INTEGER,
             link        TEXT,
             description TEXT
           );`,
          [],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          },
        );
      },
      error => reject(error),
    );
  });

export const dropNewsTable = (): Promise<void> =>
  new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `DROP TABLE IF EXISTS ${TABLE_NAME};`,
          [],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          },
        );
      },
      error => reject(error),
    );
  });

export const insertNewsBatch = (newsArray: NewsItemType[]): Promise<void> =>
  new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        for (const newsItem of newsArray) {
          tx.executeSql(
            `INSERT OR
             REPLACE INTO ${TABLE_NAME}
               (id, title, image, source, time, link, description)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              newsItem.id,
              newsItem.title,
              newsItem.image || '',
              newsItem.source,
              newsItem.time,
              newsItem.link || '',
              newsItem.description || '',
            ],
          );
        }
      },
      error => reject(error),
      () => resolve(),
    );
  });

export const getAllNews = (): Promise<NewsItemType[]> =>
  new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT *
         FROM ${TABLE_NAME}
         ORDER BY time DESC`,
        [],
        (_, results) => {
          const rows = results?.rows;
          const items: NewsItemType[] = [];
          for (let i = 0; i < (rows?.length || 0); i++) {
            items.push(rows.item(i));
          }
          resolve(items);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });

export default db;
