import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View, Pressable, FlatList, Dimensions, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { getAnnotationForPhoto, saveAnnotationForPhoto } from '@/db/api/photos';

export interface ViewerImage {
  uri: string;
  id?: number;
}

export interface ImageLightboxProps {
  images: ViewerImage[];
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
}

const { width, height } = Dimensions.get('window');

type Stroke = { color: string; width: number; points: { x: number; y: number }[] };

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ images, imageIndex, visible, onRequestClose }) => {
  const listRef = useRef<FlatList<ViewerImage>>(null);
  const [currentIndex, setCurrentIndex] = useState(imageIndex);
  const [annotateMode, setAnnotateMode] = useState(false);
  const [color, setColor] = useState<string>('#ff4757');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Sincroniza el índice al abrir
  useEffect(() => {
    if (visible) {
      setCurrentIndex(imageIndex);
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      requestAnimationFrame(() => {
        try { listRef.current?.scrollToIndex({ index: imageIndex, animated: false }); } catch {}
      });
    }
  }, [visible, imageIndex]);

  // Cargar anotaciones cuando cambia la imagen visible
  const loadAnnotations = useCallback(async (idx: number) => {
    const img = images[idx];
    if (img?.id) {
      const ann = await getAnnotationForPhoto(img.id);
      if (ann?.data?.strokes) {
        setStrokes(ann.data.strokes);
      } else {
        setStrokes([]);
      }
    } else {
      setStrokes([]);
    }
  }, [images]);

  useEffect(() => {
    if (visible) {
      loadAnnotations(currentIndex);
    }
  }, [visible, currentIndex, loadAnnotations]);

  const onScrollEnd = useCallback((e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(idx);
    // Reset transform al cambiar de imagen
    scale.value = withTiming(1, { duration: 150 });
    translateX.value = withTiming(0, { duration: 150 });
    translateY.value = withTiming(0, { duration: 150 });
  }, [scale, translateX, translateY]);

  // Gestos de zoom/pan
  const pinch = useMemo(() => Gesture.Pinch()
    .enabled(!annotateMode)
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(4, e.scale));
    })
    .onEnd(() => {
      if (scale.value < 1) scale.value = 1;
    })
  , [annotateMode]);

  const pan = useMemo(() => Gesture.Pan()
    .enabled(!annotateMode)
    .onUpdate((e) => {
      if (scale.value > 1) {
        // Usar translationX/translationY para mantener compatibilidad tipada
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      }
    })
  , [annotateMode]);

  const doubleTap = useMemo(() => Gesture.Tap()
    .numberOfTaps(2)
    .enabled(!annotateMode)
    .onEnd(() => {
      const next = scale.value > 1 ? 1 : 2.5;
      scale.value = withTiming(next, { duration: 150 });
      if (next === 1) {
        translateX.value = withTiming(0, { duration: 150 });
        translateY.value = withTiming(0, { duration: 150 });
      }
    })
  , [annotateMode]);

  const composedGestures = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  // Dibujo (anotación) usando Gesture Pan específico
  const drawGesture = useMemo(() => Gesture.Pan()
    .enabled(annotateMode)
    .onBegin((e) => {
      runOnJS(setActiveStroke)({ color, width: strokeWidth, points: [{ x: e.x, y: e.y }] });
    })
    .onUpdate((e) => {
      runOnJS(setActiveStroke)((prev) => {
        if (!prev) return null;
        const pts = prev.points.concat({ x: e.x, y: e.y });
        return { ...prev, points: pts };
      });
    })
    .onEnd(() => {
      runOnJS(setStrokes)((prev) => (activeStroke ? prev.concat(activeStroke) : prev));
      runOnJS(setActiveStroke)(null);
    })
  , [annotateMode, color, strokeWidth, activeStroke]);

  const handleUndo = useCallback(() => {
    setStrokes((prev) => prev.slice(0, -1));
  }, []);

  const handleSave = useCallback(async () => {
    const img = images[currentIndex];
    if (!img?.id) return;
    await saveAnnotationForPhoto(img.id, { strokes });
  }, [images, currentIndex, strokes]);

  const renderPath = (s: Stroke, idx: number) => {
    if (!s.points.length) return null;
    const d = `M ${s.points[0].x} ${s.points[0].y}` + s.points.slice(1).map(p => ` L ${p.x} ${p.y}`).join('');
    return <Path key={`stroke-${idx}`} d={d} stroke={s.color} strokeWidth={s.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  };

  const renderItem = ({ item }: { item: ViewerImage }) => (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <GestureDetector gesture={composedGestures}>
        <Animated.View style={[{ width, height, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }, animatedStyle]}>
          <Image
            source={{ uri: item.uri }}
            style={{ width, height }}
            contentFit="contain"
            transition={100}
          />
          {/* Capa de dibujo (SVG) */}
          <GestureDetector gesture={drawGesture}>
            <View pointerEvents={annotateMode ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
              <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
                {strokes.map(renderPath)}
                {activeStroke && renderPath(activeStroke, -1)}
              </Svg>
            </View>
          </GestureDetector>
        </Animated.View>
      </GestureDetector>
    </View>
  );

  // Paleta de colores simple
  const palette = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ffffff'];

  return (
    <Modal
      visible={visible}
      onRequestClose={onRequestClose}
      animationType="fade"
      transparent={false}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onRequestClose} style={styles.headerBtn}>
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => setAnnotateMode((v) => !v)} style={[styles.headerBtn, annotateMode && styles.headerBtnActive]}>
            <Ionicons name="pencil" size={20} color="#fff" />
          </Pressable>
          <Pressable onPress={handleUndo} style={styles.headerBtn}>
            <Ionicons name="arrow-undo-outline" size={20} color="#fff" />
          </Pressable>
          <Pressable onPress={handleSave} style={styles.headerBtn}>
            <Ionicons name="save-outline" size={20} color="#fff" />
          </Pressable>
        </View>
        {/* Paleta de color */}
        {annotateMode && (
          <View style={styles.paletteRow}>
            {palette.map((c) => (
              <Pressable key={c} onPress={() => setColor(c)} style={styles.colorDotWrapper}>
                <View style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]} />
              </Pressable>
            ))}
          </View>
        )}
        <FlatList
          ref={listRef}
          data={images}
          keyExtractor={(_, idx) => `img-${idx}`}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          getItemLayout={getItemLayout}
          initialNumToRender={1}
          windowSize={3}
          onMomentumScrollEnd={onScrollEnd}
        />
        <View style={styles.footer}>
          <Text style={styles.counter}>{images.length > 0 ? `${currentIndex + 1} / ${images.length}` : ''}</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginLeft: 8,
  },
  headerBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  colorDotWrapper: { marginRight: 8 },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  colorDotActive: {
    borderColor: '#fff',
    borderWidth: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  counter: {
    color: '#fff',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
