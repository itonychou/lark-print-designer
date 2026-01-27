import {
  useSelectElementInfoStore,
  IBaseElementType,
  usePrintElementListStore,
  useSettingModalStore,
  sourceElementTypes,
  usePrintRecordElementListStore,
  useTableRecordData,
  IPrintElementListType,
  ISelectElementInfoType,
  ITableRecordDataStoreType,
  IPrintRecordElementListType,
  ISettingModalType,
} from '@/store';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useMemo, useRef, useState } from 'react';
import Moveable from 'react-moveable';
import { flushSync } from 'react-dom';
import { radiansToDegrees } from '@/lib/utils';
import parse from 'html-react-parser';
import { getCellValueToString } from '@/api/lark';

interface ITextPropsType {
  elementInfo: IBaseElementType;
}

export const TextPrintElement: React.FC<ITextPropsType> = (props) => {
  const { elementInfo } = props;
  const { content, styles, uuid, sourceType, fieldId, rotate, fieldType } =
    elementInfo;
  const { width = 200, height = 60, top, left } = styles;
  const targetRef = useRef<HTMLImageElement>(null);

  const { selectElementInfo, changeSelectElementInfo } =
    useSelectElementInfoStore((state: ISelectElementInfoType) => state);

  const settingModal = useSettingModalStore(
    (state: ISettingModalType) => state.settingModal,
  );
  const { updatePrintElement } = usePrintElementListStore(
    (state: IPrintElementListType) => state,
  );

  const { updatePrintRecordElement } = usePrintRecordElementListStore(
    (state: IPrintRecordElementListType) => state,
  );

  const { activeRecordId } = useTableRecordData(
    (state: ITableRecordDataStoreType) => state,
  );

  const isElementEdit = useMemo(() => {
    if (!selectElementInfo) {
      return false;
    }
    return selectElementInfo.uuid === uuid && selectElementInfo.isEdit;
  }, [selectElementInfo]);

  const [cellValue, setCellValue] = useState<string>();

  useEffect(() => {
    const fn = async () => {
      const cellString = await getCellValueToString(
        fieldId as string,
        activeRecordId,
        fieldType as number,
      );
      setCellValue(cellString);
    };
    fn();
  }, [fieldId, activeRecordId, fieldType]);

  const setEditingElement = () => {
    if (!settingModal) return;
    changeSelectElementInfo({
      ...elementInfo,
      isEdit: true,
    });
  };

  const valueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updatePrintElement({
      ...elementInfo,
      content: e.target.value,
    });
    changeSelectElementInfo({
      ...elementInfo,
      isEdit: true,
      content: e.target.value,
    });
  };

  return (
    <div
      id={uuid}
      className="printElement"
      style={{
        position: 'absolute',
        top,
        left,
        width,
        height,
        padding: '10px 10px',
      }}
    >
      <div
        ref={targetRef}
        id={`uuid-${uuid}`}
        style={{
          border: settingModal ? '1px dashed #020617' : 'none',
          cursor: settingModal ? 'move' : 'default',
          wordWrap: 'break-word',
          color: styles.color,
          fontSize: styles.fontSize,
          textAlign: styles.textAlign,
          lineHeight: styles.lineHeight,
          transform: `rotate(${rotate}deg)`,
        }}
      >
        {sourceType !== sourceElementTypes.Table ? (
          <>
            {isElementEdit ? (
              <Textarea
                style={{
                  padding: '0px 0px',
                  fontSize: styles.fontSize,
                  textAlign: styles.textAlign,
                  lineHeight: styles.lineHeight,
                }}
                value={content}
                onChange={(e) => valueChange(e)}
                className="h-full w-full rounded-none"
              />
            ) : (
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {parse(`<p>${content}</p>`)}
              </div>
            )}
          </>
        ) : (
          fieldId && (
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {parse(`<p>${cellValue}</p>`)}
            </div>
          )
        )}
      </div>
      <Moveable
        // options
        preventDefault={false}
        flushSync={flushSync}
        target={settingModal ? targetRef : null} // move拖拽对象
        origin={false} // 显示中心点
        keepRatio={false} // 保持宽高
        edge={true} //
        useMutationObserver={true} // 跟随目标css属性设置而变换
        draggable={settingModal} // 开启拖砖
        resizable={settingModal} // 开启调整大小
        rotatable={false} // 开启旋转
        zoom={settingModal ? 1 : 0}
        throttleDrag={0}
        renderDirections={['e', 's']} // 变化的点
        hideDefaultLines={true}
        padding={{
          left: 5,
          right: 10,
          top: 5,
          bottom: 10,
        }}
        onRender={(e) => {
          console.log('onRender');
          e.target.style.cssText += e.cssText;
        }}
        onClick={() => {
          setEditingElement();
        }}
        onRenderEnd={(e) => {
          if (e.isDrag) {
            e.target.style.transform = `rotate(${radiansToDegrees(
              e.transformObject.rotate,
            )}deg)`;

            if (sourceType === sourceElementTypes.Base) {
              updatePrintElement({
                ...elementInfo,
                rotate: radiansToDegrees(e.transformObject.rotate),
                styles: {
                  ...styles,
                  left: left + e.transformObject.translate[0],
                  top: top + e.transformObject.translate[1],
                  width: parseInt(e.target.style.width),
                  height: parseInt(e.target.style.height),
                },
              });
            } else {
              updatePrintRecordElement({
                ...elementInfo,
                rotate: radiansToDegrees(e.transformObject.rotate),
                styles: {
                  ...styles,
                  left: left + e.transformObject.translate[0],
                  top: top + e.transformObject.translate[1],
                  width: parseInt(e.target.style.width),
                  height: parseInt(e.target.style.height),
                },
              });
            }
          }
        }}
      />
    </div>
  );
};
