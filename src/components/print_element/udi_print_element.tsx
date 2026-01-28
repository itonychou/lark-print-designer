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
import { generateGS1DataMatrix, validateUDI } from '@/lib/udiUtils';
import { getCellValueToString } from '@/api/lark';

// 条形码缓存，避免重复生成相同的条形码
const barcodeCache = new Map<string, string>();

interface IUdiPropsType {
  elementInfo: IBaseElementType;
}

export const UdiPrintElement: React.FC<IUdiPropsType> = (props) => {
  const { elementInfo } = props;
  const { content, styles, uuid, sourceType, fieldId, rotate, fieldType } = elementInfo;
  const targetRef = useRef<HTMLDivElement>(null);

  const { selectElementInfo, changeSelectElementInfo } = useSelectElementInfoStore(
    (state: ISelectElementInfoType) => state
  );

  const settingModal = useSettingModalStore(
    (state: ISettingModalType) => state.settingModal
  );
  const { updatePrintElement } = usePrintElementListStore(
    (state: IPrintElementListType) => state
  );

  const { updatePrintRecordElement } = usePrintRecordElementListStore(
    (state: IPrintRecordElementListType) => state
  );

  const { activeRecordId } = useTableRecordData(
    (state: ITableRecordDataStoreType) => state
  );

  const isElementEdit = useMemo(() => {
    if (!selectElementInfo) {
      return false;
    }
    return selectElementInfo.uuid === uuid && selectElementInfo.isEdit;
  }, [selectElementInfo]);

  const [cellValue, setCellValue] = useState<string>();
  const [barcodeSvg, setBarcodeSvg] = useState<string>('');

  useEffect(() => {
    const fn = async () => {
      const cellString = await getCellValueToString(
        fieldId as string,
        activeRecordId,
        fieldType as number
      );
      setCellValue(cellString);
    };
    fn();
  }, [fieldId, activeRecordId, fieldType]);

  useEffect(() => {
    console.log('UDI useEffect triggered:', { content, cellValue, sourceType, styles });
    
    // 生成条形码
    const udiContent = sourceType !== sourceElementTypes.Table ? content : cellValue;
    console.log('UDI content to generate:', udiContent);
    
    if (udiContent && validateUDI(udiContent)) {
      console.log('UDI validation passed');
      try {
        // 转换宽度和高度为数字
        const width = styles.width || 200;
        const height = styles.height || 200;
        const numericWidth = typeof width === 'string' ? parseInt(width) : width;
        const numericHeight = typeof height === 'string' ? parseInt(height) : height;
        // 获取颜色样式
        const color = styles.color || '#000000';
        
        console.log('Generating barcode with params:', { 
          udiContent, 
          numericWidth, 
          numericHeight, 
          color 
        });
        
        // 生成缓存键，包含颜色信息
        const cacheKey = `${udiContent}_${numericWidth}_${numericHeight}_${color}`;
        
        // 检查缓存中是否已有生成的条形码
        if (barcodeCache.has(cacheKey)) {
          // 使用缓存的条形码
          console.log('Using cached barcode');
          setBarcodeSvg(barcodeCache.get(cacheKey)!);
        } else {
          // 生成新的条形码
          console.log('Generating new barcode...');
          const svg = generateGS1DataMatrix(udiContent, {
            width: numericWidth,
            height: numericHeight,
            scale: 2,
            color: color,
          });
          console.log('Barcode generated, SVG length:', svg.length);
          console.log('SVG preview:', svg.substring(0, 200));
          
          // 存入缓存
          barcodeCache.set(cacheKey, svg);
          setBarcodeSvg(svg);
          
          // 注意：自动保存已移除，下载功能仅在点击"Generate Barcode"按钮时执行
        }
      } catch (error) {
        console.error('Error generating barcode:', error);
        setBarcodeSvg('');
      }
    } else {
      console.log('UDI validation failed or no content');
      setBarcodeSvg('');
    }
  }, [content, cellValue, sourceType, styles]);

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

  // 点击空白区域保存修改
  const handleClickOutside = () => {
    if (isElementEdit) {
      changeSelectElementInfo({
        ...elementInfo,
        isEdit: false,
      });
    }
  };

  return (
    <div
      id={uuid}
      className="printElement"
      style={{
        position: 'absolute',
        top: styles.top,
        left: styles.left,
        width: styles.width,
        height: styles.height,
        padding: '10px 10px',
      }}
      onClick={handleClickOutside}
    >
      <div
        ref={targetRef}
        id={`uuid-${uuid}`}
        style={{
          border: settingModal ? '1px dashed #020617' : 'none',
          cursor: settingModal ? 'move' : 'default',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `rotate(${rotate}deg)`,
          width: '100%',
          height: '100%',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setEditingElement();
        }}
      >
        {sourceType !== sourceElementTypes.Table ? (
          <>
            {isElementEdit ? (
              <Textarea
                style={{
                  padding: '10px',
                  fontSize: '12px',
                  textAlign: 'left',
                  lineHeight: '1.4',
                }}
                value={content}
                onChange={(e) => valueChange(e)}
                onClick={(e) => e.stopPropagation()}
                className="h-full w-full rounded-none"
                placeholder="Enter UDI code in GS1 format, e.g., (01)12345678901234(17)231231(10)ABC123"
              />
            ) : (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                overflow: 'hidden'
              }}>
                {barcodeSvg ? (
                  <div 
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: barcodeSvg.replace(/<svg/, '<svg style="max-width:100%;max-height:100%;width:100%;height:100%;"') 
                    }} 
                  />
                ) : (
                  <div style={{ color: '#999', fontSize: '12px', textAlign: 'center' }}>
                    Invalid UDI format
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          fieldId && (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              {barcodeSvg ? (
                <div 
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: barcodeSvg.replace(/<svg/, '<svg style="max-width:100%;max-height:100%;width:100%;height:100%;"') 
                  }} 
                />
              ) : (
                <div style={{ color: '#999', fontSize: '12px', textAlign: 'center' }}>
                  Invalid UDI format
                </div>
              )}
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
              e.transformObject.rotate
            )}deg)`;

            if (sourceType === sourceElementTypes.Base) {
              updatePrintElement({
                ...elementInfo,
                rotate: radiansToDegrees(e.transformObject.rotate),
                styles: {
                  ...styles,
                  left: (styles.left || 0) + e.transformObject.translate[0],
                  top: (styles.top || 0) + e.transformObject.translate[1],
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
                  left: (styles.left || 0) + e.transformObject.translate[0],
                  top: (styles.top || 0) + e.transformObject.translate[1],
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
