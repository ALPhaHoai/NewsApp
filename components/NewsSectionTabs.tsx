import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const NewsSectionTabs: React.FC = () => (
    <View style={styles.topTabs}>
        <TouchableOpacity style={styles.tabActive}>
            <Text style={styles.tabTextActive}>Nóng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Mới</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Bóng đá VN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Bóng đá Q</Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    topTabs: {
        flex: 1,
        flexDirection: 'row',
        marginLeft: 10,
        marginRight: 10,
    },
    tab: { marginHorizontal: 7 },
    tabActive: {
        marginHorizontal: 7,
        borderBottomWidth: 3,
        borderBottomColor: '#fff',
        paddingBottom: 5,
    },
    tabText: { color: '#e0e0e0', fontSize: 16, fontWeight: '400' },
    tabTextActive: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default NewsSectionTabs;
