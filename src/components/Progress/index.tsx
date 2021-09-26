/*
 * @Author: zhujian021
 * @Date: 2021-09-24 09:52:46
 * @LastEditors: zhujian
 * @LastEditTime: 2021-09-26 15:07:31
 * @Description: 你 kin 你擦
 */
import React, { useCallback, useEffect, useRef } from 'react';
import cn from 'classnames';
import './index.scss';

interface ProgressProps {
  /**
   * 百分比
   */
  percent: number;
  /**
   * 容器宽度
   */
  width?: number;
  /**
   * 进度条宽度
   */
  lineWidth?: number;
  /**
   * style
   */
  style?: {
    [key: string]: any;
  };
  /**
   * classname
   */
  classname?: string;
  /**
   * 外圈背景色
   */
  outRingColor?: string;
  /**
   * 内圈背景色
   */
  innerRingColor?: string;
  /**
   * 是否展示数值
   */
  showStatistic?: boolean;
  /**
   * 数值栏className
   */
  statisticClassName?: string;
  /**
   * 是否展示动画
   */
  showAnimation?: boolean;
  /**
   * 动画时长，单位ms
   */
  animationDuration?: number;
}

/**
 * 环形进度条
 * @param {ProgressProps} props
 * @returns
 */
const Progress = ({
  percent = 0,
  style,
  classname,
  width = 140,
  lineWidth = 10,
  outRingColor = '#f5f5f5',
  innerRingColor = '#03c067',
  showStatistic = true,
  statisticClassName,
  showAnimation = true,
  animationDuration = 600,
}: ProgressProps) => {
  const container = useRef<HTMLCanvasElement>();
  const drawInterval = useRef<any>();
  const stepPercent = useRef<number>(0);

  /**
   * canvas画圈
   * @param ctx 2D上下文
   * @param arcRadius 半径
   * @param strokeStyle
   * @param progress
   */
  const canvasDrawArc = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      arcRadius: number,
      strokeStyle: string,
      progress: number
    ) => {
      const halfLineWidth = lineWidth / 2;
      ctx.beginPath();
      ctx.arc(
        arcRadius,
        arcRadius,
        arcRadius - halfLineWidth,
        Math.PI,
        (1 + progress) * Math.PI
      );
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.closePath();
    },
    [lineWidth]
  );

  useEffect(() => {
    const ctx = container.current.getContext('2d');
    if (!ctx) {
      console.log('不支持canvas, 兼容性处理');
    } else {
      const halfWidth = width / 2;
      const halfLineWidth = lineWidth / 2;
      container.current.setAttribute('width', `${width}px`);
      container.current.setAttribute(
        'height',
        `${halfWidth + halfLineWidth}px`
      );
      // 外圈
      canvasDrawArc(ctx, halfWidth, outRingColor, 1);

      // 内圈, 实际进度
      // 展现动画
      if (showAnimation && animationDuration) {
        const interval = animationDuration / (percent * 100);
        drawInterval.current = setInterval(() => {
          stepPercent.current += 0.01;
          if (stepPercent.current <= percent) {
            ctx.clearRect(0, 0, width, width);
            // 重新绘制外圈
            canvasDrawArc(ctx, halfWidth, outRingColor, 1);
            // 按帧绘制内圈
            canvasDrawArc(ctx, halfWidth, innerRingColor, stepPercent.current);
          } else {
            clearInterval(drawInterval.current);
            drawInterval.current = null;
          }
        }, interval);
      } else {
        // 不显示动画，直接绘制
        canvasDrawArc(ctx, halfWidth, innerRingColor, percent);
      }
    }

    return () => {
      if (drawInterval.current) {
        clearInterval(drawInterval.current);
        drawInterval.current = null;
      }
    };
  }, [
    animationDuration,
    canvasDrawArc,
    innerRingColor,
    lineWidth,
    outRingColor,
    percent,
    showAnimation,
    width,
  ]);

  return (
    <div
      className={cn('progressContainer', classname)}
      style={{ ...style, width }}
    >
      <canvas ref={container} className={cn('progressCanvas')} />
      {showStatistic && (
        <div className={cn('progressGrade', statisticClassName)}>
          <span>{percent * 100}</span>/100
        </div>
      )}
    </div>
  );
};

export default Progress;
