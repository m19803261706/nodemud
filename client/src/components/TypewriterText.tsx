/**
 * 打字机效果文字组件
 * 逐字显示文字，营造武侠旁白代入感
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Text, Animated, type TextStyle, type StyleProp } from 'react-native';

interface TypewriterTextProps {
  /** 要显示的文字 */
  text: string;
  /** 每个字的间隔毫秒数，默认 80 */
  speed?: number;
  /** 开始前延迟毫秒数，默认 0 */
  delay?: number;
  /** 打字完成回调 */
  onComplete?: () => void;
  /** 文字样式 */
  style?: StyleProp<TextStyle>;
  /** 是否显示光标 */
  showCursor?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 80,
  delay = 0,
  onComplete,
  style,
  showCursor = true,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 光标闪烁动画
  useEffect(() => {
    if (!showCursor || isComplete) {
      return;
    }
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    blink.start();
    return () => blink.stop();
  }, [showCursor, isComplete, cursorOpacity]);

  // 逐字显示
  useEffect(() => {
    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);

    const startTyping = () => {
      const tick = () => {
        if (indexRef.current < text.length) {
          indexRef.current += 1;
          setDisplayedText(text.slice(0, indexRef.current));
          timerRef.current = setTimeout(tick, speed);
        } else {
          setIsComplete(true);
          onComplete?.();
        }
      };
      tick();
    };

    timerRef.current = setTimeout(startTyping, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [text, speed, delay, onComplete]);

  return (
    <Text style={style}>
      {displayedText}
      {showCursor && !isComplete && (
        <Animated.Text style={{ opacity: cursorOpacity }}>|</Animated.Text>
      )}
    </Text>
  );
};

/**
 * 多段打字机效果 Hook
 * 依次显示多段文字，每段完成后显示下一段
 */
export function useTypewriterSequence(
  texts: string[],
  options?: { speed?: number; delayBetween?: number; onAllComplete?: () => void },
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allComplete, setAllComplete] = useState(false);
  const onAllCompleteRef = useRef(options?.onAllComplete);
  const delayBetweenRef = useRef(options?.delayBetween ?? 600);

  onAllCompleteRef.current = options?.onAllComplete;
  delayBetweenRef.current = options?.delayBetween ?? 600;

  const handleComplete = useCallback(() => {
    if (currentIndex < texts.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, delayBetweenRef.current);
    } else {
      setAllComplete(true);
      onAllCompleteRef.current?.();
    }
  }, [currentIndex, texts.length]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setAllComplete(false);
  }, []);

  return {
    currentIndex,
    allComplete,
    handleComplete,
    visibleTexts: texts.slice(0, currentIndex + 1),
    reset,
  };
}
