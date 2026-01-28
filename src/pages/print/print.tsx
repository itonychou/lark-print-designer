import { ItemTypes, paperSizeList } from '@/store/constants';
import { useDrop } from 'react-dnd';
import {
  usePrintElementListStore,
  IElementType,
  IBaseElementType,
  useSelectElementInfoStore,
  useSheetShow,
  usePrintRecordElementListStore,
  useSettingModalStore,
  IPrintElementListType,
  ISelectElementInfoType,
  ISheetShowStoreType,
  IPrintRecordElementListType,
  ISettingModalType,
  usePaperSizeStore,
  IPaperSizeModalType,
  PaperSize,
} from '@/store';
import {
  TextPrintElement,
  ImagePrintElement,
  TablePrintElement,
  PdfPrintElement,
  UdiPrintElement,
} from '@/components/print_element';
import { FC, useMemo } from 'react';
import { HorizontaRulerCanvas, VerticalRulerCanvas } from '@/pages/ruler';
import { extractNumberFromLengthString } from '@/lib/utils';

type NullableString = string | null;

const findAttributeId = (
  element: HTMLElement | HTMLDivElement,
): NullableString => {
  // 如果当前元素包含了所需属性，返回该属性的值
  if (element.hasAttribute('id')) {
    return element.getAttribute('id');
  } else {
    // 否则，递归查找父元素的属性
    if (element.parentElement) {
      return findAttributeId(element.parentElement);
    } else {
      // 如果没有父元素，返回null
      return null;
    }
  }
};

interface IPrintProps {
  printRef: React.RefObject<HTMLDivElement>;
}

export const Print: FC<IPrintProps> = (props) => {
  const { printRef } = props;
  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.KNIGHT,
      drop(_item, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset();
        if (!delta) return;
        const left = Math.round(delta.x);
        const top = Math.round(delta.y);
        return { top, left };
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [],
  );

  const { closeSheet } = useSheetShow((state: ISheetShowStoreType) => state);

  const { printList } = usePrintElementListStore(
    (state: IPrintElementListType) => state,
  );

  const { selectElementInfo, changeSelectElementInfo } =
    useSelectElementInfoStore((state: ISelectElementInfoType) => state);

  const { settingModal } = useSettingModalStore(
    (state: ISettingModalType) => state,
  );

  const { printRecordList } = usePrintRecordElementListStore(
    (state: IPrintRecordElementListType) => state,
  );

  const { paperSize } = usePaperSizeStore(
    (state: IPaperSizeModalType) => state,
  );

  // 重置选择元素
  const initEditElement = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const targetId = findAttributeId(e.target as HTMLDivElement);
    if (!targetId || targetId === 'root' || targetId === 'print') {
      changeSelectElementInfo(
        selectElementInfo === null
          ? null
          : { ...selectElementInfo, isEdit: false },
      );
      closeSheet();
    }
  };

  const { paperWidth, paperHeight, guideWidthMap, guideHeightMap } =
    useMemo(() => {
      const width = paperSizeList[paperSize as PaperSize].width;
      const height = paperSizeList[paperSize as PaperSize].height;
      const guideWidthMap = Array.from(
        { length: extractNumberFromLengthString(width) / 5 },
        (_, index) => index * 5,
      );
      const guideHeightMap = Array.from(
        { length: extractNumberFromLengthString(height) / 5 },
        (_, index) => index * 5,
      );
      return {
        paperWidth: width,
        paperHeight: height,
        guideWidthMap,
        guideHeightMap,
      };
    }, [paperSize]);

  return (
    <div
      className="relative flex h-full w-full justify-center overflow-scroll p-[20px]"
      ref={drop}
    >
      <div className="relative">
        <div className="absolute left-0 top-[-15px]">
          <HorizontaRulerCanvas width={paperWidth} />
        </div>
        <div className="absolute left-[-15px] top-0">
          <VerticalRulerCanvas width={paperHeight} />
        </div>

        <div
          id="print"
          ref={printRef}
          className="print-content relative  bg-[#fff]"
          onClick={(e) => initEditElement(e)}
          style={{
            width: paperWidth,
            height: paperHeight,
          }}
        >
          {settingModal && (
            <div className="h-full w-full">
              {guideWidthMap.map((item) => {
                return (
                  <div
                    className="guideLine h-full w-[1px]"
                    key={item}
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: `${item}mm`,
                      backgroundColor: 'hsla(0,0%,66.7%,.7)',
                    }}
                  />
                );
              })}
              {guideHeightMap.map((item) => {
                return (
                  <div
                    className="guideLine h-[1px] w-full"
                    key={item}
                    style={{
                      position: 'absolute',
                      left: '0',
                      top: `${item}mm`,
                      backgroundColor: 'hsla(0,0%,66.7%,.7)',
                    }}
                  />
                );
              })}
            </div>
          )}
          {printList.length > 0 &&
            printList.map((item: IBaseElementType) => {
              switch (item.type) {
                case IElementType.Text:
                  return (
                    <TextPrintElement key={item.uuid} elementInfo={item} />
                  );
                case IElementType.Image:
                  return (
                    <ImagePrintElement key={item.uuid} elementInfo={item} />
                  );
                case IElementType.Table:
                  return (
                    <TablePrintElement key={item.uuid} elementInfo={item} />
                  );
                case IElementType.Pdf:
                  return <PdfPrintElement key={item.uuid} elementInfo={item} />;
                case IElementType.Udi:
                  return <UdiPrintElement key={item.uuid} elementInfo={item} />;
              }
            })}
          {printRecordList.length > 0 &&
            printRecordList.map((item: IBaseElementType) => {
              if (item.type === IElementType.Text) {
                return <TextPrintElement key={item.uuid} elementInfo={item} />;
              } else if (item.type === IElementType.Image) {
                return <ImagePrintElement key={item.uuid} elementInfo={item} />;
              } else if (item.type === IElementType.Udi) {
                return <UdiPrintElement key={item.uuid} elementInfo={item} />;
              }
            })}
        </div>
      </div>
    </div>
  );
};
