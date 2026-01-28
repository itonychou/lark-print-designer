import { create } from 'zustand';
import { produce } from 'immer';
import { defalutBaseElements, IBaseElementType } from './types';
import { persist, createJSONStorage } from 'zustand/middleware';

// 设置模式开启
export interface ISettingModalType {
  settingModal: boolean;
  changeSettingModal: () => void;
  closeSettingModal: () => void;
}

export const useSettingModalStore = create<ISettingModalType>()((set) => ({
  settingModal: false,
  changeSettingModal: () =>
    set((state: ISettingModalType) => ({ settingModal: !state.settingModal })),
  closeSettingModal: () => set(() => ({ settingModal: false })),
}));

// 拖拽元素列表
export interface IDragElementType {
  dragList: IBaseElementType[];
  initDargList: () => void;
}

export const useDragElementStore = create<IDragElementType>()((set) => ({
  dragList: [],
  initDargList: () => set({ dragList: defalutBaseElements }),
}));

// 基础打印元素列表
export interface IPrintElementListType {
  printList: IBaseElementType[];
  addPrintElement: (elementInfo: IBaseElementType) => void;
  updatePrintElement: (elementInfo: IBaseElementType) => void;
  deletePrintElement: (uuid: string) => void;
  resetPrintElement: () => void;
  importPrintElement: (printList: IBaseElementType[]) => void;
}

export const usePrintElementListStore = create<IPrintElementListType>()(
  persist(
    (set) => ({
      printList: [] as IBaseElementType[],
      addPrintElement: (elementInfo: IBaseElementType) =>
        set((state: IPrintElementListType) => {
          const newstate = produce(state.printList, (draftState) => {
            draftState.push(elementInfo);
          });
          return { printList: newstate };
        }),
      updatePrintElement: (elementInfo: IBaseElementType) =>
        set((state: IPrintElementListType) => {
          let index = 0;
          state.printList.forEach((element: IBaseElementType, i: number) => {
            if (element.uuid === elementInfo.uuid) {
              index = i;
            }
          });
          const newstate = produce(state.printList, (draftState) => {
            draftState[index] = elementInfo;
          });
          return { printList: newstate };
        }),
      deletePrintElement: (uuid: string) =>
        set((state: IPrintElementListType) => {
          let index = 0;
          state.printList.forEach((element: IBaseElementType, i: number) => {
            if (element.uuid === uuid) {
              index = i;
            }
          });
          const newstate = produce(state.printList, (draftState) => {
            draftState.splice(index, 1);
          });
          return { printList: newstate };
        }),
      resetPrintElement: () =>
        set(() => {
          return { printList: [] };
        }),
      importPrintElement: (printList: IBaseElementType[]) =>
        set(() => {
          return { printList };
        }),
    }),
    {
      name: 'printElementListStore',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
// 选中打印元素信息
export interface ISelectElementInfoType {
  selectElementInfo: IBaseElementType | null;
  changeSelectElementInfo: (elementInfo: IBaseElementType | null) => void;
}

export const useSelectElementInfoStore = create<ISelectElementInfoType>()(
  (set) => ({
    selectElementInfo: null,
    changeSelectElementInfo: (elementInfo: IBaseElementType | null) =>
      set((state: ISelectElementInfoType) => {
        return {
          selectElementInfo: elementInfo === null ? null : { ...elementInfo },
          changeSelectElementInfo: state.changeSelectElementInfo,
        };
      }, true),
  }),
);

// 设置元素样式弹窗的显示
export interface ISheetShowStoreType {
  open: boolean;
  changeSheetShow: () => void;
  closeSheet: () => void;
  openSheet: () => void;
}

export const useSheetShow = create<ISheetShowStoreType>()((set) => ({
  open: false,
  changeSheetShow: () =>
    set((state: ISheetShowStoreType) => ({ open: !state.open })),
  closeSheet: () => set({ open: false }),
  openSheet: () => set({ open: true }),
}));

// 表格的数据
export interface IRecordsData {
  fields: {
    [key: string]: string;
  };
}
export interface ITableRecordDataStoreType {
  recordIndex: number;
  records: IRecordsData[];
  recordIds: string[];
  recordsTotal: number;
  activeRecordId: string;
  setRecordIndex: (index: number) => void;
  setTableRecordsData: (data: IRecordsData[]) => void;
  setRecordIds: (data: string[]) => void;
  setActiveRecordId: (recordId: string) => void;
}

export const useTableRecordData = create<ITableRecordDataStoreType>()(
  persist(
    (set) => ({
      recordIndex: 0,
      records: [],
      recordIds: [],
      recordsTotal: 0,
      activeRecordId: '',
      setRecordIndex: (index: number) => set({ recordIndex: index }),
      setTableRecordsData: (data: IRecordsData[]) =>
        set(() => {
          return {
            records: data,
            recordsTotal: data.length,
          };
        }),
      setRecordIds: (data: string[]) =>
        set(() => {
          return {
            recordIds: data,
            recordsTotal: data.length,
          };
        }),
      setActiveRecordId: (recordId: string) =>
        set({ activeRecordId: recordId }),
    }),
    {
      name: 'recordDataStore',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

// 表格的列数据

export interface IFieldsType {
  id: string;
  name: string;
  type: number;
}
export interface ITableFieldDataStoreType {
  fieldMap: Map<string, IFieldsType>;
  fieldIds: string[];
  setTableFieldData: (data: Map<string, IFieldsType>) => void;
  setFieldIds: (data: string[]) => void;
}

export const useTableFieldData = create<ITableFieldDataStoreType>()(
  persist(
    (set) => ({
      fieldMap: new Map(),
      fieldIds: [],
      setTableFieldData: (data: Map<string, IFieldsType>) =>
        set(() => {
          return {
            fieldMap: data,
          };
        }),
      setFieldIds: (data: string[]) =>
        set(() => {
          return {
            fieldIds: data,
          };
        }),
    }),
    {
      name: 'fieldDataStore',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

// 表格打印元素列表
export interface IPrintRecordElementListType {
  printRecordList: IBaseElementType[];
  addPrintRecordElement: (elementInfo: IBaseElementType) => void;
  updatePrintRecordElement: (elementInfo: IBaseElementType) => void;
  deletePrintRecordElement: (uuid: string) => void;
  resetPrintRecordList: () => void;
}

// 操作历史记录（用于撤销/重做）
export interface IOperation {
  type: 'add' | 'delete' | 'update';
  element: IBaseElementType;
  sourceType: 'Base' | 'Table';
  oldElement?: IBaseElementType; // 用于更新操作的旧值
}

// 多选功能
export interface IMultiSelectStoreType {
  selectedElements: IBaseElementType[];
  addSelectedElement: (element: IBaseElementType) => void;
  removeSelectedElement: (uuid: string) => void;
  clearSelectedElements: () => void;
  setSelectedElements: (elements: IBaseElementType[]) => void;
}

export const useMultiSelectStore = create<IMultiSelectStoreType>()((set) => ({
  selectedElements: [],
  addSelectedElement: (element: IBaseElementType) =>
    set((state: IMultiSelectStoreType) => {
      if (!state.selectedElements.some(el => el.uuid === element.uuid)) {
        return {
          selectedElements: [...state.selectedElements, element],
        };
      }
      return state;
    }),
  removeSelectedElement: (uuid: string) =>
    set((state: IMultiSelectStoreType) => ({
      selectedElements: state.selectedElements.filter(el => el.uuid !== uuid),
    })),
  clearSelectedElements: () =>
    set(() => ({
      selectedElements: [],
    })),
  setSelectedElements: (elements: IBaseElementType[]) =>
    set(() => ({
      selectedElements: elements,
    })),
}));

export interface IUndoRedoStoreType {
  history: IOperation[];
  historyIndex: number;
  addOperation: (operation: IOperation) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

export const useUndoRedoStore = create<IUndoRedoStoreType>()((set) => ({
  history: [],
  historyIndex: -1,
  addOperation: (operation: IOperation) =>
    set((state: IUndoRedoStoreType) => {
      // 截断历史记录到当前索引
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(operation);
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }),
  undo: () =>
    set((state: IUndoRedoStoreType) => {
      if (state.historyIndex >= 0) {
        return {
          historyIndex: state.historyIndex - 1,
        };
      }
      return state;
    }),
  redo: () =>
    set((state: IUndoRedoStoreType) => {
      if (state.historyIndex < state.history.length - 1) {
        return {
          historyIndex: state.historyIndex + 1,
        };
      }
      return state;
    }),
  clearHistory: () =>
    set(() => ({
      history: [],
      historyIndex: -1,
    })),
}));

export const usePrintRecordElementListStore =
  create<IPrintRecordElementListType>()(
    persist(
      (set) => ({
        printRecordList: [] as IBaseElementType[],
        addPrintRecordElement: (elementInfo: IBaseElementType) =>
          set((state: IPrintRecordElementListType) => {
            const newstate = produce(state.printRecordList, (draftState) => {
              draftState.push(elementInfo);
            });
            return { printRecordList: newstate };
          }),
        updatePrintRecordElement: (elementInfo: IBaseElementType) =>
          set((state: IPrintRecordElementListType) => {
            let index = 0;
            state.printRecordList.forEach(
              (element: IBaseElementType, i: number) => {
                if (element.uuid === elementInfo.uuid) {
                  index = i;
                }
              },
            );
            const newstate = produce(state.printRecordList, (draftState) => {
              draftState[index] = elementInfo;
            });
            return { printRecordList: newstate };
          }),
        deletePrintRecordElement: (uuid: string) =>
          set((state: IPrintRecordElementListType) => {
            let index = -1;
            state.printRecordList.forEach(
              (element: IBaseElementType, i: number) => {
                if (element.uuid === uuid) {
                  index = i;
                }
              },
            );
            if (index !== -1) {
              const newstate = produce(state.printRecordList, (draftState) => {
                draftState.splice(index, 1);
              });
              return { printRecordList: newstate };
            }
            return { printRecordList: state.printRecordList };
          }),
        resetPrintRecordList: () =>
          set(() => {
            return { printRecordList: [] };
          }),
      }),
      {
        name: 'printRecordListStore',
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  );

// 打印区域的坐标
interface IPrintPosition {
  scrollLeft: number;
  scrollTop: number;
  top: number;
  left: number;
}

export interface IPrintAreaPositionStoreType {
  position: IPrintPosition;
  setPrintAreaPosition: (newPosition: IPrintPosition) => void;
}

export const usePrintAreaPosition = create<IPrintAreaPositionStoreType>()(
  (set) => ({
    position: {
      top: 0,
      left: 0,
      scrollLeft: 0,
      scrollTop: 0,
    },
    setPrintAreaPosition: (newPosition: IPrintPosition) =>
      set(() => {
        return { position: { ...newPosition } };
      }),
  }),
);

// word模版设置
export interface IWordTemplatesType {
  wordTemplateModal: boolean;
  setWordTemplateModal: (isWordTemplate: boolean) => void;
}

export const useWordTemplates = create<IWordTemplatesType>()((set) => ({
  wordTemplateModal: false,
  setWordTemplateModal: (isWordTemplate: boolean) =>
    set(() => {
      return { wordTemplateModal: isWordTemplate };
    }),
}));
