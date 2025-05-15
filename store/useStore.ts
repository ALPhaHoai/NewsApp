import {create} from 'zustand';
import {NewsItemType} from '@type/types.ts';

type StoreState = {
  homeLoading: boolean;
  data: NewsItemType[];
  setData: (data: NewsItemType[]) => void;
  setHomeLoading: (isLoading: boolean) => void;
};

const useStore = create<StoreState>(set => ({
  homeLoading: false,
  data: [],
  setData: data => set({data: data}),
  setHomeLoading: isLoading => set({homeLoading: !!isLoading}),
}));

export default useStore;
