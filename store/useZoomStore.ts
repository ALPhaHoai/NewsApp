import {create} from 'zustand';

interface ZoomOverlayState {
  visible: boolean;
  source: {uri: string} | null;
  caption?: string;
  fallbackTitle?: string;
  showOverlay: (
    img: {uri: string},
    caption?: string,
    fallbackTitle?: string,
  ) => void;
  hideOverlay: () => void;
}

const useZoomStore = create<ZoomOverlayState>(set => ({
  visible: false,
  source: null,
  caption: undefined,
  fallbackTitle: undefined,
  showOverlay: (source, caption, fallbackTitle) =>
    set({visible: true, source, caption, fallbackTitle}),
  hideOverlay: () =>
    set({
      visible: false,
      source: null,
      caption: undefined,
      fallbackTitle: undefined,
    }),
}));

export default useZoomStore;
