# NewsFeedApp

NewsFeedApp is a React Native application that aggregates and displays Vietnamese news via multiple RSS feeds. Users can read articles, refresh content, and enjoy features like offline support and text-to-speech.

## Features

- 🇻🇳 Aggregate latest Vietnamese news from sources like VnExpress.
- 📰 Modern news list with images, categories, and pull-to-refresh.
- 🔊 Built-in Text-to-Speech (TTS) using Vietnamese as default.
- ⚡️ Fast local storage with SQLite for offline reading.
- 🎚 Tab and bottom navigation (SVG icons, Zustand for UI state).
- 🔍 Basic top-bar search (placeholder, can be extended).

## Getting Started

### Prerequisites

- Node.js ≥ 14
- React Native CLI or Expo CLI
- Yarn or npm

### Installation

1. Clone the repository:
    ```
    git clone https://github.com/yourusername/newsfeedapp.git
    cd newsfeedapp
    ```

2. Install dependencies:
    ```
    yarn install
    # or
    npm install
    ```

3. Install required dependencies for vector icons, SQLite, SVG, TTS, etc:
    ```
    yarn add react-native-tts react-native-vector-icons react-native-svg zustand
    yarn add react-native-sqlite-storage
    # or use npm
    ```

4. Link native modules or run pod install if needed:
    - For bare React Native:  
      `npx pod-install ios`
    - For Expo:  
      Use appropriate managed workflow support.

### Running the App

- **Android:**
    ```
    npx react-native run-android
    ```
- **iOS:**
    ```
    npx react-native run-ios
    ```

## How It Works

- **App.tsx**: Orchestrates data fetching, offline caching, and renders the UI.
- **News fetching**: Pulls RSS feeds, deduplicates, sorts, and stores for offline.
- **Navigation**: Uses a custom `<BottomNavigationBar />` built with SVG and Zustand for active state.
- **TTS**: Vietnamese news articles can be read aloud.
- **Custom Components**: Modular approach (`NewsItem`, `NewsSectionTabs`).

## Dependencies

- [react-native-tts](https://github.com/ak1394/react-native-tts)
- [react-native-vector-icons](https://github.com/oblador/react-native-vector-icons)
- [react-native-svg](https://github.com/software-mansion/react-native-svg)
- [zustand](https://github.com/pmndrs/zustand)
- [react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage)

## Customization

- **Add or remove RSS feeds:** Edit the `rssLinks` array in `App.tsx`.
- **Modify news UI:** Update `NewsItem.tsx`.
- **Change navigation tabs/icons:** Edit `BottomNavigationBar.tsx`.
- **Add offline features:** The SQLite cache can be further improved.

## Screenshots

*Add screenshots here!*

## License

MIT

## Author

[Your name or GitHub link]

**Happy reading 👓✨!**
