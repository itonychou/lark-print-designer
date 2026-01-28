import { create } from 'zustand';

export interface IPaperSizeModalType {
  paperSize: string;
  changePaperSize: (data: string) => void;
}

export const usePaperSizeStore = create<IPaperSizeModalType>()((set) => ({
  paperSize: '标准外箱签',
  changePaperSize: (data: string) => set(() => ({ paperSize: data })),
}));
