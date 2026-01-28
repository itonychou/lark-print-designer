import { Print } from './pages/print/print';
import { ToolBar } from './pages/tool_bar';
import { StyleSetting } from './pages/style_setting';
import { EditToolBar } from '@/pages/edit_tool_bar';
import { EditLeftToolBar } from '@/pages/edit_left_tool_bar';
import { RecordElementContent } from './pages/record_element_content';
import { BaseElementsContent } from './pages/elements_content/base_element_content';
import {
  useSettingModalStore,
  usePrintAreaPosition,
  ISettingModalType,
  IPrintAreaPositionStoreType,
  useTableRecordData,
  ITableRecordDataStoreType,
  useTableFieldData,
  ITableFieldDataStoreType,
  useSelectElementInfoStore,
  ISelectElementInfoType,
  usePrintElementListStore,
  IPrintElementListType,
  usePrintRecordElementListStore,
  IPrintRecordElementListType,
  useUndoRedoStore,
  IUndoRedoStoreType,
  useMultiSelectStore,
  IMultiSelectStoreType,
  IBaseElementType,
} from './store';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { useWindowSize, useScroll } from 'react-use';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

import '@icon-park/react/styles/index.css';
import {
  bitable,
  PermissionEntity,
  OperationType,
} from '@lark-base-open/js-sdk';

export const Home = () => {
  const settingModal = useSettingModalStore(
    (state: ISettingModalType) => state.settingModal,
  );
  const printRef = useRef<HTMLDivElement>(null);
  const { setPrintAreaPosition } = usePrintAreaPosition(
    (state: IPrintAreaPositionStoreType) => state,
  );
  const { width, height } = useWindowSize();
  const { x: scrollLeft, y: scrollTop } = useScroll(printRef);

  useEffect(() => {
    if (printRef.current) {
      setPrintAreaPosition({
        top: printRef.current.getBoundingClientRect().top,
        left: printRef.current.getBoundingClientRect().left,
        scrollTop,
        scrollLeft,
      });
    }
  }, [width, height, scrollLeft, scrollTop, setPrintAreaPosition]);

  const {
    recordIndex,
    setRecordIndex,
    recordsTotal,
    setRecordIds,
    setActiveRecordId,
    recordIds,
  } = useTableRecordData((state: ITableRecordDataStoreType) => state);
  const canNext = recordIndex < recordsTotal - 1;
  const canPre = recordIndex > 0;

  const nextRecord = () => {
    if (recordIndex < recordsTotal - 1) {
      setRecordIndex(recordIndex + 1);
      setActiveRecordId(recordIds[recordIndex + 1]);
    }
  };

  const preRecord = () => {
    if (recordIndex > 0) {
      setRecordIndex(recordIndex - 1);
      setActiveRecordId(recordIds[recordIndex - 1]);
    }
  };

  const { selectElementInfo, changeSelectElementInfo } = useSelectElementInfoStore(
    (state: ISelectElementInfoType) => state,
  );

  const { deletePrintElement, addPrintElement } = usePrintElementListStore(
    (state: IPrintElementListType) => state,
  );

  const { deletePrintRecordElement, addPrintRecordElement } = usePrintRecordElementListStore(
    (state: IPrintRecordElementListType) => state,
  );

  const { undo, redo } = useUndoRedoStore(
    (state: IUndoRedoStoreType) => ({ undo: state.undo, redo: state.redo }),
  );

  // 复制粘贴功能
  const [clipboard, setClipboard] = useState<IBaseElementType | null>(null);

  // 多选功能
  const { selectedElements, addSelectedElement, removeSelectedElement, clearSelectedElements } = useMultiSelectStore(
    (state: IMultiSelectStoreType) => state,
  );

  const { t } = useTranslation();

  const { setTableFieldData, setFieldIds } = useTableFieldData(
    (state: ITableFieldDataStoreType) => state,
  );

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Delete 键删除选中元素
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // 检查当前是否有输入框处于编辑状态
        const activeElement = document.activeElement;
        const isEditingInput = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.getAttribute('contenteditable') === 'true'
        );
        
        // 如果正在编辑输入框，不执行删除元素操作
        if (isEditingInput) {
          return;
        }
        
        if (selectElementInfo && selectElementInfo.uuid) {
          const { uuid, sourceType } = selectElementInfo;
          if (sourceType === 'Base') {
            deletePrintElement(uuid);
          } else if (sourceType === 'Table') {
            deletePrintRecordElement(uuid);
          }
          changeSelectElementInfo(null);
        }
      }

      // Ctrl+Z 撤销操作
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        undo();
        console.log('Undo operation');
      }

      // Ctrl+Y 重做操作
      if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
        event.preventDefault();
        redo();
        console.log('Redo operation');
      }

      // Ctrl+C 复制选中元素
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        event.preventDefault();
        if (selectElementInfo) {
          setClipboard(selectElementInfo);
          console.log('Copied element:', selectElementInfo);
        }
      }

      // Ctrl+V 粘贴元素
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        if (clipboard) {
          // 创建复制元素的副本，生成新的 uuid
          // 确保 top 和 left 是数字类型
          const top = typeof clipboard.styles.top === 'string' 
            ? parseInt(clipboard.styles.top) 
            : (clipboard.styles.top || 0);
          const left = typeof clipboard.styles.left === 'string' 
            ? parseInt(clipboard.styles.left) 
            : (clipboard.styles.left || 0);
          
          const copiedElement = {
            ...clipboard,
            uuid: `copy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            styles: {
              ...clipboard.styles,
              // 稍微偏移位置，避免重叠
              top: top + 20,
              left: left + 20,
            },
          };

          // 根据元素类型添加到相应的列表
          if (copiedElement.sourceType === 'Base') {
            addPrintElement(copiedElement);
          } else if (copiedElement.sourceType === 'Table') {
            addPrintRecordElement(copiedElement);
          }

          console.log('Pasted element:', copiedElement);
        }
      }

      // Ctrl+A 全选元素
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        // 全选功能待实现
        console.log('Select all elements');
      }
    };

    // 添加键盘事件监听
    window.addEventListener('keydown', handleKeyDown);

    // 清理事件监听
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectElementInfo, deletePrintElement, deletePrintRecordElement, changeSelectElementInfo, undo, redo, clipboard, addPrintElement, addPrintRecordElement, selectedElements, addSelectedElement, removeSelectedElement, clearSelectedElements]);

  const baseTable = bitable.base;

  useEffect(() => {
    const fn = async () => {
      // 判断是否有表格下载权限
      // 获取下载权限（下载和打印归属一个权限）
      const bool = await baseTable.getPermission({
        entity: PermissionEntity.Base,
        type: OperationType.Printable,
      });
      console.log('bool', bool);
      if (!bool) {
        return;
      }

      const table = await baseTable.getActiveTable();

      // 获取列信息
      const fieldMap = new Map();
      const fieldIds: string[] = [];
      const tableFieldMetaList = await table.getFieldMetaList();
      tableFieldMetaList.forEach((field) => {
        fieldMap.set(field.id, field);
        fieldIds.push(field.id);
      });
      console.log('fieldMap---->', fieldMap);
      setTableFieldData(fieldMap);
      setFieldIds(fieldIds);

      // 获取行信息
      const { recordIds: recordIdList } = await table.getRecordIdListByPage({
        pageSize: 200,
      });
      console.log('recordIdList--->', recordIdList);
      setRecordIds(recordIdList);
      setActiveRecordId(recordIdList[recordIndex]);
    };

    fn();

    // 表格选择监听
    bitable.base.onSelectionChange((event: { data: any }) => {
      console.log('current selection', event);
      if (event.data.recordId) {
        setActiveRecordId(event.data.recordId);
      }
    });
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen">
        <div className="fixed z-50 w-full bg-[#fff]">
          <ToolBar printRef={printRef} />
        </div>
        <div className="mx-[16px] flex h-full justify-start bg-gray-100 pt-[54px]">
          {settingModal && (
            <div className="border-r-1 flex w-[280px] min-w-[200px] flex-col  border-gray-700 bg-[#fff] px-2 py-[20px]">
              <div className="h-[300px]">
                <h2 className="mb-4">{t('base_elements')}</h2>
                <BaseElementsContent />
              </div>
              <div className="flex flex-col">
                <h2 className="mb-4">{t('table_elements')}</h2>
                <div className="flex justify-center mb-4 space-x-2">
                  <Button
                    className="w-[150px]"
                    disabled={!canPre}
                    onClick={() => preRecord()}
                  >
                    {t('previous')}
                  </Button>
                  <Button
                    className="w-[150px]"
                    disabled={!canNext}
                    onClick={() => nextRecord()}
                  >
                    {t('next')}
                  </Button>
                </div>
                <RecordElementContent />
              </div>
            </div>
          )}
          <div className="relative h-full grow px-[70px] pt-[54px]">
            <div className="absolute top-0 left-0 w-full">
              {settingModal && <EditToolBar />}
            </div>
            <div className="h-full grow">
              <Print printRef={printRef} />
            </div>
            <div className="absolute left-0 top-[52px] h-full">
              {settingModal && <EditLeftToolBar />}
            </div>
          </div>
          {settingModal && <StyleSetting />}
        </div>
      </div>
    </DndProvider>
  );
};
