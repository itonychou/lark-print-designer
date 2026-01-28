/**
 * UDI性能测试工具
 * 用于测试条形码生成的性能表现
 */

import { generateGS1DataMatrix, parseUDI } from './udiUtils';

/**
 * 测试条形码生成性能
 * @param iterations 测试迭代次数
 * @param udiContent UDI编码内容
 * @returns 性能测试结果
 */
export function testBarcodeGenerationPerformance(
  iterations: number = 100,
  udiContent: string = '(01)12345678901234(17)231231(10)ABC123'
): {
  averageTime: number;
  totalTime: number;
  iterations: number;
} {
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    generateGS1DataMatrix(udiContent, {
      width: 200,
      height: 200,
      scale: 2,
    });
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const averageTime = totalTime / iterations;
  
  return {
    averageTime,
    totalTime,
    iterations,
  };
}

/**
 * 测试UDI解析性能
 * @param iterations 测试迭代次数
 * @param udiContent UDI编码内容
 * @returns 性能测试结果
 */
export function testUDIParsePerformance(
  iterations: number = 1000,
  udiContent: string = '(01)12345678901234(17)231231(10)ABC123'
): {
  averageTime: number;
  totalTime: number;
  iterations: number;
} {
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    parseUDI(udiContent);
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const averageTime = totalTime / iterations;
  
  return {
    averageTime,
    totalTime,
    iterations,
  };
}

/**
 * 运行完整的性能测试套件
 */
export function runPerformanceTests() {
  console.log('=== UDI性能测试套件 ===');
  
  // 测试条形码生成性能
  console.log('\n1. 条形码生成性能测试:');
  const barcodeResult = testBarcodeGenerationPerformance();
  console.log(`   迭代次数: ${barcodeResult.iterations}`);
  console.log(`   总时间: ${barcodeResult.totalTime.toFixed(2)}ms`);
  console.log(`   平均时间: ${barcodeResult.averageTime.toFixed(4)}ms`);
  
  // 测试UDI解析性能
  console.log('\n2. UDI解析性能测试:');
  const parseResult = testUDIParsePerformance();
  console.log(`   迭代次数: ${parseResult.iterations}`);
  console.log(`   总时间: ${parseResult.totalTime.toFixed(2)}ms`);
  console.log(`   平均时间: ${parseResult.averageTime.toFixed(4)}ms`);
  
  console.log('\n=== 性能测试完成 ===');
}

/**
 * 性能优化建议
 */
export const performanceOptimizationTips = [
  '1. 实现条形码缓存机制，避免重复生成相同的条形码',
  '2. 使用Web Worker处理复杂的条形码生成任务，避免阻塞主线程',
  '3. 优化UDI解析算法，减少正则表达式的使用',
  '4. 延迟加载bwip-js库，只在需要时加载',
  '5. 限制条形码的最大尺寸，避免生成过大的条形码',
  '6. 使用SVG格式的条形码，它比Canvas或PNG格式更轻量',
];
