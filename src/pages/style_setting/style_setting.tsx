import {
  useSelectElementInfoStore,
  usePrintElementListStore,
  textElementInputList,
  imageElementInputList,
  tableElementInputList,
  pdfElementInputList,
  udiElementInputList,
  IElementType,
  sourceElementTypes,
  usePrintRecordElementListStore,
  IPrintElementListType,
  ISelectElementInfoType,
  IPrintRecordElementListType,
  fontSizeValue,
  lineHeightValue,
  IBaseElementType,
} from '@/store';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { generateGS1DataMatrix, validateUDI, saveBarcodeToFile } from '@/lib/udiUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableElementSetting } from './table_element_setting';
import { PdfElementSetting } from './pdf_element_setting';
import { useTranslation } from 'react-i18next';

export const StyleSetting: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation();
  
  // UDI下载开关状态
  const [udiDownloadEnabled, setUdiDownloadEnabled] = useState(false);

  const { selectElementInfo, changeSelectElementInfo } =
    useSelectElementInfoStore((state: ISelectElementInfoType) => state);

  const { updatePrintElement, deletePrintElement } = usePrintElementListStore(
    (state: IPrintElementListType) => state,
  );

  const { updatePrintRecordElement, deletePrintRecordElement } =
    usePrintRecordElementListStore(
      (state: IPrintRecordElementListType) => state,
    );

  const inputList = useMemo(() => {
    if (!selectElementInfo) return [];
    switch (selectElementInfo.type) {
      case IElementType.Text:
        return textElementInputList;
      case IElementType.Image:
        return imageElementInputList;
      case IElementType.Table:
        return tableElementInputList;
      case IElementType.Pdf:
        return pdfElementInputList;
      case IElementType.Udi:
        return udiElementInputList;
      default:
        return [];
    }
  }, [selectElementInfo]);

  const valueChange = (
    changeInfo: Pick<IBaseElementType, 'styles' | 'src' | 'content' | 'rotate'>,
  ) => {
    if (!selectElementInfo) return;
    if (selectElementInfo?.sourceType === sourceElementTypes.Table) {
      updatePrintRecordElement({
        ...selectElementInfo,
        ...changeInfo,
      });
    } else {
      updatePrintElement({
        ...selectElementInfo,
        ...changeInfo,
      });
    }
    changeSelectElementInfo({
      ...selectElementInfo,
      ...changeInfo,
    });
  };

  const deleteElement = (uuid: string | undefined) => {
    if (!uuid) return;
    if (selectElementInfo?.sourceType === sourceElementTypes.Table) {
      deletePrintRecordElement(uuid);
    } else {
      deletePrintElement(uuid);
    }
    changeSelectElementInfo(null);
  };

  return (
    <div className="border-r-1 relative flex w-[280px] min-w-[200px] flex-col  border-gray-700 bg-[#fff] px-[10px] py-[20px]">
      {selectElementInfo?.uuid && (
        <>
          <h2 className="mb-4">{t('element_setting')}</h2>
          <div className="grid grid-cols-2 gap-4">
            {inputList.map((item: string) => {
              switch (item) {
                case 'content':
                case 'src':
                  if (selectElementInfo.sourceType === sourceElementTypes.Table)
                    return null;
                  return (
                    <div key={item} className="col-span-2 mb-4 flex flex-col">
                      <Label className="mb-2 mr-4">{item}:</Label>
                      <Textarea
                        value={selectElementInfo[item]}
                        disabled={!selectElementInfo.isEdit}
                        onChange={(e) =>
                          valueChange({
                            [item]: e.target.value,
                            styles: selectElementInfo.styles,
                          })
                        }
                      />
                    </div>
                  );
                case 'width':
                case 'height':
                case 'top':
                case 'left':
                  return (
                    <div key={item} className="mb-4 flex flex-col">
                      <Label className="mb-2 mr-4">{item}: </Label>
                      <Input
                        type="number"
                        disabled={!selectElementInfo.isEdit}
                        value={selectElementInfo.styles[item]}
                        onChange={(e) =>
                          valueChange({
                            styles: {
                              ...selectElementInfo.styles,
                              [item]: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  );
                case 'fontSize':
                case 'lineHeight':
                  return (
                    <div key={item} className="mb-4 flex flex-col">
                      <Label className="mb-2 mr-4">{item}: </Label>
                      <Select
                        disabled={!selectElementInfo.isEdit}
                        onValueChange={(value) =>
                          valueChange({
                            styles: {
                              ...selectElementInfo.styles,
                              [item]: value,
                            },
                          })
                        }
                        defaultValue={selectElementInfo.styles[item] as string}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Text Align" />
                        </SelectTrigger>
                        <SelectContent className="h-[200px]">
                          {item === 'fontSize'
                            ? fontSizeValue.map((value) => {
                                return (
                                  <SelectItem key={value} value={value}>
                                    {value}
                                  </SelectItem>
                                );
                              })
                            : lineHeightValue.map((value) => {
                                return (
                                  <SelectItem key={value} value={value}>
                                    {value}
                                  </SelectItem>
                                );
                              })}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                case 'color':
                  return (
                    <div key={item} className="mb-4 flex flex-col">
                      <Label className="mb-2 mr-4">{item}: </Label>
                      <Input
                        type="color"
                        disabled={!selectElementInfo.isEdit}
                        value={selectElementInfo.styles[item]}
                        onChange={(e) => {
                          valueChange({
                            styles: {
                              ...selectElementInfo.styles,
                              [item]: e.target.value,
                            },
                          });
                        }}
                      />
                    </div>
                  );
                case 'textAlign':
                  return (
                    <div key={item} className="mb-4 flex flex-col">
                      <Label className="mb-2 mr-4">{item}: </Label>
                      <Select
                        defaultValue={selectElementInfo.styles[item] || 'left'}
                        disabled={!selectElementInfo.isEdit}
                        onValueChange={(value) =>
                          valueChange({
                            styles: {
                              ...selectElementInfo.styles,
                              [item]: value as React.CSSProperties['textAlign'],
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Text Align" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                case 'rotate':
                  return (
                    <div key={item} className="mb-4 flex flex-col">
                      <Label className="mb-2 mr-4">{item}: </Label>
                      <Input
                        type="number"
                        step="any"
                        disabled={!selectElementInfo.isEdit}
                        value={selectElementInfo[item]}
                        onChange={(e) =>
                          valueChange({
                            [item]: parseFloat(e.target.value),
                            styles: selectElementInfo.styles,
                          })
                        }
                      />
                    </div>
                  );
              }
            })}
          </div>
          {selectElementInfo.type === IElementType.Table && (
            <TableElementSetting selectElementInfo={selectElementInfo} />
          )}
          {selectElementInfo.type === IElementType.Pdf && (
            <PdfElementSetting selectElementInfo={selectElementInfo} />
          )}
          
          {/* UDI元素专用的生成按钮和下载开关 */}
          {selectElementInfo.type === IElementType.Udi && (
            <>
              {/* 下载开关 */}
              <div className="mt-4 flex items-center justify-between rounded-lg border p-3">
                <div className="flex flex-col">
                  <Label className="text-sm font-medium">Download Image</Label>
                  <span className="text-xs text-gray-500">
                    {udiDownloadEnabled ? 'Auto download enabled' : 'Display only'}
                  </span>
                </div>
                <Switch
                  checked={udiDownloadEnabled}
                  onCheckedChange={setUdiDownloadEnabled}
                />
              </div>
              
              {/* 生成按钮 */}
              <Button
                className="mt-4 w-[100%]"
                variant="default"
                onClick={() => {
                  const udiContent = selectElementInfo.content;
                  if (udiContent && validateUDI(udiContent)) {
                    try {
                      // 生成新的条形码
                      const width = selectElementInfo.styles.width || 200;
                      const height = selectElementInfo.styles.height || 200;
                      const color = selectElementInfo.styles.color || '#000000';
                      
                      const numericWidth = typeof width === 'string' ? parseInt(width) : width;
                      const numericHeight = typeof height === 'string' ? parseInt(height) : height;
                      
                      const svg = generateGS1DataMatrix(udiContent, {
                        width: numericWidth,
                        height: numericHeight,
                        scale: 2,
                        color: color,
                      });
                      
                      // 根据开关状态决定是否下载
                      if (udiDownloadEnabled) {
                        const saveResult = saveBarcodeToFile(svg);
                        console.log('Barcode generated and saved:', saveResult);
                      } else {
                        console.log('Barcode generated (display only)');
                      }
                      
                      // 强制更新元素状态，确保UI刷新
                      if (selectElementInfo?.sourceType === sourceElementTypes.Table) {
                        updatePrintRecordElement(selectElementInfo);
                      } else {
                        updatePrintElement(selectElementInfo);
                      }
                      
                      alert(udiDownloadEnabled 
                        ? 'Barcode generated and downloaded!' 
                        : 'Barcode generated successfully!'
                      );
                    } catch (error) {
                      console.error('Error generating barcode:', error);
                      alert('Error generating barcode: ' + (error as Error).message);
                    }
                  } else {
                    alert('Invalid UDI format. Please check your UDI content.');
                  }
                }}
              >
                Generate Barcode
              </Button>
            </>
          )}
          
          <Button
            className="bottom-0 mt-4 w-[100%]"
            variant="outline"
            onClick={() => deleteElement(selectElementInfo.uuid)}
          >
            {t('delete_element')}
          </Button>
        </>
      )}
    </div>
  );
};
