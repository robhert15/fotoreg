import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View, Pressable, Dimensions, StyleSheet, Text, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import PagerView from 'react-native-pager-view';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
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
  const pagerRef = useRef<PagerView>(null);
  const [currentIndex, setCurrentIndex] = useState(imageIndex);
  const [annotateMode, setAnnotateMode] = useState(false);
  const [color, setColor] = useState<string>('#ff4757');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // Sincroniza el índice al abrir
  useEffect(() => {
    if (visible) {
      setCurrentIndex(imageIndex);
      requestAnimationFrame(() => {
        try { pagerRef.current?.setPageWithoutAnimation?.(imageIndex); } catch {}
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

  const handlePageSelected = useCallback((e: any) => {
    const idx = e?.nativeEvent?.position ?? 0;
    setCurrentIndex(idx);
    setIsZoomed(false);
    // Cargar anotaciones para la nueva imagen
    loadAnnotations(idx);
  }, [loadAnnotations]);

  // Dibujo (anotación) usando PanResponder para capturar toques en overlay
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => annotateMode,
      onMoveShouldSetPanResponder: () => annotateMode,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        const { locationX: x, locationY: y } = e.nativeEvent as any;
        setActiveStroke({ color, width: strokeWidth, points: [{ x, y }] });
      },
      onPanResponderMove: (e: GestureResponderEvent, _gs: PanResponderGestureState) => {
        const { locationX: x, locationY: y } = e.nativeEvent as any;
        setActiveStroke((prev) => {
          if (!prev) return null;
          return { ...prev, points: prev.points.concat({ x, y }) };
        });
      },
      onPanResponderRelease: () => {
        setStrokes((prev) => (activeStroke ? prev.concat(activeStroke) : prev));
        setActiveStroke(null);
      },
      onPanResponderTerminate: () => {
        setStrokes((prev) => (activeStroke ? prev.concat(activeStroke) : prev));
        setActiveStroke(null);
      },
    })
  ).current;

  // Renderizado del trazo (SVG), las líneas escalan junto con la imagen
  
  const handleUndo = useCallback(() => {
    setStrokes((prev) => prev.slice(0, -1));
  }, [setStrokes]);

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

  const renderPage = (item: ViewerImage, index: number) => (
    <View key={`page-${index}`} style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <ReactNativeZoomableView
        maxZoom={4}
        minZoom={1}
        initialZoom={1}
        zoomStep={0.5}
        bindToBorders
        zoomEnabled={!annotateMode}
        onZoomAfter={(event: GestureResponderEvent | null, gestureState: PanResponderGestureState | null, zoomableViewEventObject: any) => {
          const level = (zoomableViewEventObject?.zoomLevel ?? 1) as number;
          setIsZoomed(level > 1);
        }}
        style={{ width, height }}
      >
        <View style={{ width, height, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={{ uri: item.uri }}
            style={{ width, height }}
            contentFit="contain"
            transition={100}
          />
          {/* Overlay de dibujo escalable */}
          <View
            style={StyleSheet.absoluteFill}
            pointerEvents={annotateMode ? 'auto' : 'none'}
            {...(annotateMode ? panResponder.panHandlers : {})}
          >
            <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
              {strokes.map(renderPath)}
              {activeStroke && renderPath(activeStroke, -1)}
            </Svg>
          </View>
        </View>
      </ReactNativeZoomableView>
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
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={imageIndex}
          onPageSelected={handlePageSelected}
          scrollEnabled={!isZoomed && !annotateMode}
        >
          {images.map((img, idx) => renderPage(img, idx))}
        </PagerView>
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
  pager: { flex: 1 },
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
