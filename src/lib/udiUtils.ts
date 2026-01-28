// @ts-ignore - bwip-js has its own type definitions but TypeScript is not finding them
import * as bwipjs from 'bwip-js';

// 文件系统模块导入（仅在Node.js环境中可用）
let fs: any = null;
let path: any = null;
try {
  fs = require('fs');
  path = require('path');
} catch (e) {
  // 在浏览器环境中忽略
  console.log('File system module not available in browser environment');
}

/**
 * UDI解析结果接口
 */
export interface UdiParseResult {
  /** 产品标识 */
  di: string;
  /** 生产标识 */
  pi: {
    /** 有效期 */
    expirationDate?: string;
    /** 生产批号 */
    lotNumber?: string;
    /** 序列号 */
    serialNumber?: string;
    /** 生产日期 */
    manufacturingDate?: string;
    /** 其他标识 */
    [key: string]: string | undefined;
  };
  /** 原始UDI编码 */
  originalUdi: string;
}

/**
 * 解析UDI编码
 * @param udiString UDI编码字符串
 * @returns 解析结果
 */
export function parseUDI(udiString: string): UdiParseResult {
  const result: UdiParseResult = {
    di: '',
    pi: {},
    originalUdi: udiString,
  };

  // 解析GS1格式的UDI编码 (01)12345678901234(17)231231(10)ABC123
  const aiPattern = /\((\d{2,4})\)([^(]+)/g;
  let match;

  while ((match = aiPattern.exec(udiString)) !== null) {
    const [, ai, value] = match;

    switch (ai) {
      case '01':
        // 全球贸易项目代码(GTIN)
        result.di = value;
        break;
      case '17':
        // 有效期
        result.pi.expirationDate = value;
        break;
      case '10':
        // 生产批号
        result.pi.lotNumber = value;
        break;
      case '21':
        // 序列号
        result.pi.serialNumber = value;
        break;
      case '11':
        // 生产日期
        result.pi.manufacturingDate = value;
        break;
      default:
        // 其他AI标识符
        result.pi[ai] = value;
        break;
    }
  }

  return result;
}

/**
 * 生成GS1 DataMatrix条形码
 * @param gs1String GS1格式的字符串
 * @param options 配置选项
 * @returns SVG格式的条形码
 */
export function generateGS1DataMatrix(
  gs1String: string,
  options: {
    width?: number;
    height?: number;
    scale?: number;
    color?: string;
  } = {}
): string {
  const {
    width = 200,
    height = 200,
    scale = 2,
    color = '#000000', // 默认黑色
  } = options;

  // 生成GS1 DataMatrix条形码
  // 注意：GS1 DataMatrix需要使用 gs1datamatrix 类型
  const svg = bwipjs.toSVG({
    bcid: 'gs1datamatrix', // GS1 DataMatrix条形码类型
    text: gs1String,       // GS1格式的文本
    scale: scale,          // 缩放比例
    width: width,          // 宽度
    height: height,        // 高度
    includetext: false,    // 不包含文本
    color: color,          // 条形码颜色
  });

  return svg;
}

/**
 * 验证UDI编码格式
 * @param udiString UDI编码字符串
 * @returns 是否有效
 */
export function validateUDI(udiString: string): boolean {
  // 简单验证：检查是否包含至少一个AI标识符
  return /\(\d{2,4}\)/.test(udiString);
}

/**
 * 格式化UDI编码为GS1格式
 * @param udiData UDI数据
 * @returns GS1格式的字符串
 */
export function formatUDItoGS1(udiData: {
  di: string;
  pi?: {
    expirationDate?: string;
    lotNumber?: string;
    serialNumber?: string;
    manufacturingDate?: string;
    [key: string]: string | undefined;
  };
}): string {
  let gs1String = `(01)${udiData.di}`;

  if (udiData.pi) {
    if (udiData.pi.expirationDate) {
      gs1String += `(17)${udiData.pi.expirationDate}`;
    }
    if (udiData.pi.lotNumber) {
      gs1String += `(10)${udiData.pi.lotNumber}`;
    }
    if (udiData.pi.serialNumber) {
      gs1String += `(21)${udiData.pi.serialNumber}`;
    }
    if (udiData.pi.manufacturingDate) {
      gs1String += `(11)${udiData.pi.manufacturingDate}`;
    }
    // 处理其他AI标识符
    Object.entries(udiData.pi).forEach(([key, value]) => {
      if (!['expirationDate', 'lotNumber', 'serialNumber', 'manufacturingDate'].includes(key) && value) {
        gs1String += `(${key})${value}`;
      }
    });
  }

  return gs1String;
}

/**
 * 保存条形码到文件
 * @param svgString SVG格式的条形码字符串
 * @returns 保存的文件路径或错误信息
 */
export function saveBarcodeToFile(
  svgString: string
): string {
  // 生成基于内容的简短哈希，用于文件名
  const hash = Math.abs(
    svgString.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0)
  ).toString(16);

  // 生成时间戳
  const timestamp = Date.now();

  // 构建文件名
  const fileName = `udi-barcode-${timestamp}-${hash}.svg`;

  // 检查文件系统模块是否可用（Node.js环境）
  if (fs && path) {
    try {
      // 定义保存目录 - 项目根目录下的udi-test文件夹
      const projectRoot = path.resolve(__dirname, '../../..');
      const saveDir = path.join(projectRoot, 'udi-test');

      // 确保目录存在
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
      }

      // 构建完整文件路径
      const filePath = path.join(saveDir, fileName);

      // 保存文件
      fs.writeFileSync(filePath, svgString);

      // 返回保存的文件路径
      return filePath;
    } catch (error) {
      console.error('Error saving barcode to file (Node.js):', error);
      // 如果Node.js保存失败，尝试浏览器环境保存
    }
  }

  // 浏览器环境：创建下载链接
  try {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理URL对象
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    return `Downloaded: ${fileName}`;
  } catch (error) {
    console.error('Error saving barcode to file (Browser):', error);
    return `Error saving file: ${(error as Error).message}`;
  }
}
