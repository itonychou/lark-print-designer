import { FieldType } from '@lark-base-open/js-sdk';

export enum ItemTypes {
  KNIGHT = 'KNIGHT',
}

export enum sourceElementTypes {
  Base = 'Base',
  Table = 'Table',
}

export const textElementInputList = [
  'width',
  'height',
  'left',
  'top',
  'content',
  'color',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'textAlign',
  'rotate',
];

export const textFieldType = [
  'singleLineText',
  'number',
  'singleSelect',
  'longText',
];

export const imageFieldTypeMap = ['attachment'];

export const imageElementInputList = [
  'src',
  'width',
  'height',
  'left',
  'top',
  'rotate',
];

export const tableElementInputList = [
  'width',
  'height',
  'left',
  'top',
  'rotate',
];

export const pdfElementInputList = ['width', 'height', 'left', 'top', 'rotate'];

export const fontSizeValue = [
  '8pt',
  '9pt',
  '10pt',
  '11pt',
  '12pt',
  '14pt',
  '16pt',
  '18pt',
  '20pt',
  '22pt',
  '24pt',
  '26pt',
  '28pt',
  '36pt',
  '48pt',
  '72pt',
];

export const lineHeightValue = [
  '6pt',
  '6.75pt',
  '7.5pt',
  '8.25pt',
  '9pt',
  '9.75pt',
  '10.5pt',
  '11.25pt',
  '12pt',
  '12.75pt',
  '13.5pt',
  '14.25pt',
  '15pt',
  '15.75pt',
  '16.5pt',
  '17.25pt',
  '18pt',
  '18.75pt',
  '19.5pt',
  '20.25pt',
  '21pt',
  '21.75pt',
  '22.5pt',
  '23.25pt',
  '24pt',
  '24.75pt',
  '25.5pt',
  '26.25pt',
  '27pt',
  '27.75pt',
  '28.5pt',
  '29.25pt',
  '30pt',
  '30.75pt',
  '31.5pt',
  '32.25pt',
  '33pt',
  '33.75pt',
  '34.5pt',
  '35.25pt',
  '36pt',
];

export const paperSizeList = {
  A3: {
    width: '297mm',
    height: '420mm',
  },
  A4: {
    width: '210mm',
    height: '296mm',
  },
  A5: {
    width: '148mm',
    height: '210mm',
  },
  A6: {
    width: '105mm',
    height: '148mm',
  },
  B3: {
    width: '500mm',
    height: '351mm',
  },
  B4: {
    width: '257mm',
    height: '364mm',
  },
  B5: {
    width: '182mm',
    height: '257mm',
  },
  Label: {
    width: '70mm',
    height: '50mm',
  },
  '三联三等分纸': {
    width: '241mm',
    height: '93.1mm',
  },
};

export const textContentFieldType = [
  FieldType.Text, // 文本列
  FieldType.AutoNumber, // 自动编号
  FieldType.CreatedTime, // 创建时间
  FieldType.CreatedUser, // 创建人
  FieldType.DateTime, // 日期列
  FieldType.Email, // 邮箱列
  FieldType.GroupChat, // 讨论组
  FieldType.ModifiedTime, // 修改日期
  FieldType.SingleSelect, // 单向选择
  FieldType.User, // 成员
  FieldType.SingleLink, // 单向关联
  FieldType.Number, // 数字列
  FieldType.Phone, // 电话列
  FieldType.MultiSelect, // 多选列
  FieldType.Currency, // 货币列
  FieldType.Formula, // 公式列
  FieldType.Url, // url 列
];

export const attachmentContentFieldType = [FieldType.Attachment];

export const paperSizeOption = ['三联三等分纸', 'A3', 'A4', 'A5', 'A6', 'B3', 'B4', 'B5', 'Label'];
