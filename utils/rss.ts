import axios from 'axios';
import {XMLParser} from 'fast-xml-parser';

export interface RssItem {
    title: string;
    description?: string;
    pubDate?: string;
    link?: string;
    guid?: string;
    id?: number;
    enclosure?: {
        "@_url"?: string;
        "@_type"?: string;
        "@_length"?: string;
    };
}

export interface RssChannel {
    title?: string;
    description?: string;
    link?: string;
    item: RssItem[]; // luôn là array
}

export interface RssRoot {
    rss: {
        channel: RssChannel;
    };
}

// Parse một feed RSS, trả về mảng RssItem (mỗi tin tức)
export const fetchRssData = async (rssUrl: string): Promise<{
    title?: string;
    description?: string;
    link?: string;
    items: RssItem[];
}> => {
    // 1. Fetch XML as text
    const response = await axios.get(rssUrl, { responseType: 'text' });

    // 2. Parse XML sang JS object
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        parseTagValue: true,
        isArray: (name) => name === 'item', // always parse <item> as array
    });
    const data = parser.parse(response.data) as RssRoot;

    let items = data?.rss?.channel?.item ?? [];
    if (!Array.isArray(items)) items = [items];

    for (const item of items) {
        item.id = parseIdFromLink(item.link);
    }

    return {
        title: data?.rss?.channel?.title,
        description: data?.rss?.channel?.description,
        link: data?.rss?.channel?.link,
        items: items as RssItem[],
    };
};

export function parseIdFromLink(link: string | undefined): number | undefined {
    const m = (link || '').match(/-(\d+)\.html$/);
    return m ? Number(m[1]) : undefined;
}
