import { Dimensions, StyleSheet, Text, View } from "react-native";
import React, { useEffect, forwardRef, useImperativeHandle } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 300; // fully expanded
const START_POSITION = -SCREEN_HEIGHT / 9; // default closed

const BottomSheetContainer = forwardRef((_, ref) => {
  const translateY = useSharedValue(START_POSITION);
  const context = useSharedValue({ y: 0 });

  useImperativeHandle(ref, () => ({
    open: () => {
      translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 20 });
    },
    close: () => {
      translateY.value = withSpring(START_POSITION, { damping: 20 });
    },
  }));

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;

      // Only limit top (fully expanded); allow dragging below start
      translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
    })
    .onEnd(() => {
      // Snap to nearest point: either fully expanded or default start
      const middle = (START_POSITION + MAX_TRANSLATE_Y) / 2;
      if (translateY.value > middle) {
        translateY.value = withSpring(START_POSITION, { damping: 20 });
      } else {
        translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 20 });
      }
    });

  useEffect(() => {
    translateY.value = withSpring(START_POSITION, { damping: 20 });
  }, []);

  const rBottomSheetStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      translateY.value,
      [MAX_TRANSLATE_Y, START_POSITION],
      [25, 10],
      Extrapolate.CLAMP
    );
    return {
      borderRadius,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[bottomStyles.container, rBottomSheetStyle]}>
        <View style={bottomStyles.line}></View>
        <Text>BottomSheetContainer</Text>
      </Animated.View>
    </GestureDetector>
  );
});

export default BottomSheetContainer;

const bottomStyles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT,
    width: "100%",
    backgroundColor: "white",
    position: "absolute",
    top: SCREEN_HEIGHT,
    borderRadius: 25,
  },
  line: {
    width: 75,
    height: 4,
    backgroundColor: "grey",
    alignSelf: "center",
    marginVertical: 15,
    borderRadius: 2,
  },
});
