import React, {Ref, useCallback, useEffect, useImperativeHandle} from 'react';
import {StyleSheet, Dimensions, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type BottomSheetProps = {
  children?: React.ReactNode;
};

export type BottomSheetRefProps = {
  scrollTo: (destination: number) => void;
  isActive: () => boolean;
};

const {height} = Dimensions.get('window');

export const BottomSheet = React.forwardRef<
  BottomSheetRefProps,
  BottomSheetProps
>(({children}, ref) => {
  const translateY = useSharedValue(0);
  const active = useSharedValue(false);

  const context = useSharedValue({y: 0});
  const scrollTo = useCallback((destination: number) => {
    'worklet';
    active.value = destination !== 0;
    translateY.value = withSpring(destination, {damping: 50});
  }, []);
  const isActive = useCallback(() => {
    return active.value;
  }, []);
  useImperativeHandle(ref, () => ({scrollTo, isActive}), [scrollTo, isActive]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = {y: translateY.value};
    })
    .onUpdate(event => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(translateY.value, -height);
    })
    .onEnd(() => {
      if (translateY.value > -height / 3) {
        scrollTo(0);
      } else if (translateY.value < -height / 2) {
        scrollTo(-height);
      }
    });
  const rBottomSheetStyle = useAnimatedStyle(() => {
    const borderRadious = interpolate(
      translateY.value,
      [-height + 50, -height],
      [35, 5],
      Extrapolate.CLAMP,
    );
    return {
      borderRadius: borderRadious,
      transform: [
        {
          translateY: translateY.value,
        },
      ],
    };
  });
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
        <View style={styles.line} />
        {children}
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height,
    width: '100%',
    backgroundColor: '#fff',
    position: 'absolute',
    top: height,
    alignItems: 'center',
    borderRadius: 25,
  },
  line: {
    width: 75,
    height: 6,
    backgroundColor: 'gray',
    marginVertical: 10,
    borderRadius: 2,
  },
});
