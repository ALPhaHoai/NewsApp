import SQLite from 'react-native-sqlite-storage';
import {NewsItemType} from './types.ts';

let db: SQLite.SQLiteDatabase | null = null;

export const openDB = () =>
    new Promise<SQLite.SQLiteDatabase>((resolve, reject) => {
        db = SQLite.openDatabase(
            { name: 'News.db', location: 'default' },
            () => { resolve(db!); },
            (error) => { console.log('DB open error:', error); reject(error); }
        );
    });

export const initNewsTable = (): void => {
    db.transaction(tx => {
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS news
             (
                 id     INTEGER PRIMARY KEY NOT NULL,
                 title  TEXT,
                 image  TEXT,
                 source TEXT,
                 time   TEXT,
                 link   TEXT
             );`
        );
    });
};


export const dropNewsTable = (): Promise<void> =>
    new Promise((resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(
                    'DROP TABLE IF EXISTS news;',
                    [],
                    () => resolve(),
                    (_, error) => { reject(error); return false; }
                );
            },
            (error) => reject(error)
        );
    });

export const insertNewsBatch = (newsArray: NewsItemType[]): Promise<void> =>
    new Promise((resolve, reject) => {
        db.transaction(
            tx => {
                for (const newsItem of newsArray) {
                    tx.executeSql(
                        `INSERT OR
                         REPLACE INTO news (id, title, image, source, time, link)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            newsItem.id,      // number - ok
                            newsItem.title,
                            newsItem.image || '',
                            newsItem.source,
                            newsItem.time,
                            newsItem.link || ''
                        ]
                    );
                }
            },
            (error) => reject(error),
            () => resolve()
        );
    });


export const getAllNews = (): Promise<NewsItemType[]> =>
    new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM news ORDER BY time DESC`,
                [],
                (_, results) => {
                    const rows = results?.rows;
                    let items: NewsItemType[] = [];
                    for (let i = 0; i < (rows?.length || 0); i++) {
                        items.push(rows.item(i));
                    }
                    resolve(items); // <-- never null
                },
                (_, error) => { reject(error); return false; }
            );
        });
    });

export default db;
