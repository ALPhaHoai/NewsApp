import { create } from 'zustand';

type CounterState = {
    count: number;
    increment: () => void;
    decrement: () => void;
    set: (n: number) => void;
};

const useCounterStore = create<CounterState>((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    set: (n) => set({ count: n }),
}));

export default useCounterStore;
