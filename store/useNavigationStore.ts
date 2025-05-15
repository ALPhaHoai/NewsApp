import { create } from 'zustand';

type NavigationState = {
    activeTab: number;
    setActiveTab: (idx: number) => void;
};

const useNavigationStore = create<NavigationState>((set) => ({
    activeTab: 0,
    setActiveTab: idx => set({ activeTab: idx }),
}));

export default useNavigationStore;
