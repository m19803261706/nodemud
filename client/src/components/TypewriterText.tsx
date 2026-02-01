/**
 * 打字机效果文字组件
 * 逐字淡入显示，标点自动停顿，营造武侠旁白代入感
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Animated,
  type TextStyle,
  type StyleProp,
  StyleSheet,
} from 'react-native';

/** 标点符号停顿倍率 */
const PAUSE_CHARS: Record<string, number> = {
  '，': 2.5,
  '。': 4,
  '？': 4,
  '！': 4,
  '；': 3,
  '：': 2.5,
  '、': 1.5,
  '……': 5,
  '——': 4,
  '\n': 5,
  '—': 3,
  '"': 1.5,
  '"': 1.5,
  ',': 2.5,
  '.': 4,
  '?': 4,
  '!': 4,
};

interface TypewriterTextProps {
  /** 要显示的文字 */
  text: string;
  /** 每个字的基础间隔毫秒数，默认 80 */
  speed?: number;
  /** 开始前延迟毫秒数，默认 0 */
  delay?: number;
  /** 打字完成回调 */
  onComplete?: () => void;
  /** 文字样式 */
  style?: StyleProp<TextStyle>;
  /** 是否显示光标，默认 true */
  showCursor?: boolean;
  /** 每字淡入动画时长，默认 150ms，0 则关闭 */
  fadeInDuration?: number;
}

/** 单个字符的淡入动画组件 */
const FadeInChar: React.FC<{
  char: string;
  duration: number;
  style?: StyleProp<TextStyle>;
}> = React.memo(({ char, duration, style }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [opacity, duration]);

  return (
    <Animated.Text style={[style, { opacity }]}>
      {char}
    </Animated.Text>
  );
});

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 80,
  delay = 0,
  onComplete,
  style,
  showCursor = true,
  fadeInDuration = 150,
}) => {
  const [charCount, setCharCount] = useState(0);
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
          toValue: 0.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    blink.start();
    return () => blink.stop();
  }, [showCursor, isComplete, cursorOpacity]);

  // 逐字显示（带标点停顿）
  useEffect(() => {
    indexRef.current = 0;
    setCharCount(0);
    setIsComplete(false);

    const startTyping = () => {
      const tick = () => {
        if (indexRef.current < text.length) {
          const currentChar = text[indexRef.current];
          indexRef.current += 1;
          setCharCount(indexRef.current);

          // 根据标点符号计算停顿
          const pauseMultiplier = PAUSE_CHARS[currentChar] || 1;
          timerRef.current = setTimeout(tick, speed * pauseMultiplier);
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

  const chars = text.slice(0, charCount).split('');
  const useFadeIn = fadeInDuration > 0;

  return (
    <View style={localStyles.row}>
      <Text style={style}>
        {useFadeIn
          ? chars.map((char, i) =>
              i === chars.length - 1 ? (
                <FadeInChar
                  key={`${i}-${char}`}
                  char={char}
                  duration={fadeInDuration}
                  style={style}
                />
              ) : (
                <Text key={i}>{char}</Text>
              ),
            )
          : chars.join('')}
        {showCursor && !isComplete && (
          <Animated.Text
            style={[localStyles.cursor, { opacity: cursorOpacity }]}
          >
            ▏
          </Animated.Text>
        )}
      </Text>
    </View>
  );
};

const localStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cursor: {
    color: '#6B5D4D',
    fontSize: 14,
  },
});

/**
 * 多段打字机效果 Hook
 * 依次显示多段文字，每段完成后显示下一段
 */
export function useTypewriterSequence(
  texts: string[],
  options?: {
    speed?: number;
    delayBetween?: number;
    onAllComplete?: () => void;
  },
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
