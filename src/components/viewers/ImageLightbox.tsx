import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Modal, Text, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { getAnnotationForPhoto, saveAnnotationForPhoto } from '@/db/api/photos'; // Importar funciones de DB

// --- TIPOS Y CONSTANTES ---
const { width, height } = Dimensions.get('window');
type Stroke = { color: string; width: number; points: { x: number; y: number }[] };

// --- PROPS INTERFACES ---
interface ImageLightboxProps {
  images: { uri: string; id?: number }[];
  initialIndex?: number;
  visible: boolean;
  onClose: () => void;
}

interface ZoomableImageProps {
  imageUri: string;
  setPagerEnabled: (enabled: boolean) => void;
  annotateMode: boolean;
  strokes: Stroke[];
  activeStroke: Stroke | null;
  onStrokeStart: (point: { x: number; y: number }) => void;
  onStrokeUpdate: (point: { x: number; y: number }) => void;
  onStrokeEnd: () => void;
}

// --- COMPONENTE DE IMAGEN CON ZOOM Y DIBUJO ---
const ZoomableImage = ({ 
  imageUri, 
  setPagerEnabled, 
  annotateMode, 
  strokes, 
  activeStroke, 
  onStrokeStart, 
  onStrokeUpdate, 
  onStrokeEnd 
}: ZoomableImageProps) => {
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Gestos de Zoom y Pan
  const pinchGesture = Gesture.Pinch()
    .enabled(!annotateMode)
    .onStart(() => runOnJS(setPagerEnabled)(false))
    .onUpdate(event => { scale.value = event.scale; focalX.value = event.focalX; focalY.value = event.focalY; })
    .onEnd(() => {
      if (scale.value < 1) scale.value = withTiming(1);
      if (scale.value === 1) runOnJS(setPagerEnabled)(true);
    });

  const panGesture = Gesture.Pan()
    .enabled(!annotateMode)
    .onStart(() => { if (scale.value > 1) runOnJS(setPagerEnabled)(false); })
    .onChange(event => { if (scale.value > 1) { translateX.value = event.translationX; translateY.value = event.translationY; } })
    .onEnd(() => { if (scale.value === 1) runOnJS(setPagerEnabled)(true); });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .enabled(!annotateMode)
    .onStart(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1); translateX.value = withTiming(0); translateY.value = withTiming(0);
        runOnJS(setPagerEnabled)(true);
      } else {
        scale.value = withTiming(2);
        runOnJS(setPagerEnabled)(false);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
  }));

  const drawingGesture = Gesture.Pan()
    .enabled(annotateMode)
    .onStart(e => {
      'worklet';
      const point = { x: (e.x - translateX.value) / scale.value, y: (e.y - translateY.value) / scale.value };
      runOnJS(onStrokeStart)(point);
    })
    .onUpdate(e => {
      'worklet';
      const point = { x: (e.x - translateX.value) / scale.value, y: (e.y - translateY.value) / scale.value };
      runOnJS(onStrokeUpdate)(point);
    })
    .onEnd(() => {
      'worklet';
      runOnJS(onStrokeEnd)();
    });

  const composedZoomPan = Gesture.Simultaneous(pinchGesture, panGesture);
  // El gesto de dibujo tiene prioridad sobre el de zoom/pan
  const mainGesture = Gesture.Exclusive(drawingGesture, doubleTapGesture, composedZoomPan);

  const renderPath = (s: Stroke, idx: number) => {
    if (!s.points.length) return null;
    const d = `M ${s.points[0].x} ${s.points[0].y}` + s.points.slice(1).map(p => ` L ${p.x} ${p.y}`).join('');
    return <Path key={`stroke-${idx}`} d={d} stroke={s.color} strokeWidth={s.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  };

  return (
    <GestureDetector gesture={mainGesture}>
      <View style={styles.page}>
        <Animated.View style={[styles.image, animatedStyle]}>
          {/* Imagen */}
          {!hasError && (
            <Animated.Image 
              style={styles.image} 
              source={{ uri: imageUri }} 
              resizeMode="contain" 
              onLoadEnd={() => setIsLoading(false)}
              onError={() => { setIsLoading(false); setHasError(true); }}
            />
          )}
          {isLoading && <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color="#FFF" />}
          {hasError && <View style={[StyleSheet.absoluteFill, styles.center]}><Ionicons name="alert-circle-outline" size={60} color="#888" /></View>}
          
          {/* Overlay de Dibujo */}
          <View style={StyleSheet.absoluteFill} pointerEvents={annotateMode ? 'auto' : 'none'}>
            <Svg width={width} height={height}>
              {strokes.map(renderPath)}
              {activeStroke && renderPath(activeStroke, -1)}
            </Svg>
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

// --- COMPONENTE PRINCIPAL ---
export const ImageLightbox = ({ images, initialIndex = 0, visible, onClose }: ImageLightboxProps) => {
  const insets = useSafeAreaInsets();
  const [pagerEnabled, setPagerEnabled] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Estado de anotación
  const [annotateMode, setAnnotateMode] = useState(false);
  const [color, setColor] = useState<string>('#ff4757');
  const [allStrokes, setAllStrokes] = useState<Record<number, Stroke[]>>({});
  const [redoStack, setRedoStack] = useState<Record<number, Stroke[]>>({});
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  const currentStrokes = allStrokes[currentIndex] || [];
  const currentRedoStack = redoStack[currentIndex] || [];

  // Cargar anotaciones de la DB al abrir el visor
  useEffect(() => {
    if (visible) {
      const loadAllAnnotations = async () => {
        const annotations: Record<number, Stroke[]> = {};
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (img.id) {
            const ann = await getAnnotationForPhoto(img.id);
            if (ann?.data?.strokes) {
              annotations[i] = ann.data.strokes;
            }
          }
        }
        setAllStrokes(annotations);
      };
      loadAllAnnotations();
    }
  }, [visible, images]);

  const handleStrokeStart = useCallback((point: { x: number; y: number }) => {
    // Al iniciar un nuevo trazo, se limpia el historial de "rehacer" para la imagen actual.
    setRedoStack(prev => ({ ...prev, [currentIndex]: [] }));

    const newStroke: Stroke = { color, width: 4, points: [point] };
    setActiveStroke(newStroke);
  }, [color, currentIndex]);

  const handleStrokeUpdate = useCallback((point: { x: number; y: number }) => {
    setActiveStroke(prev => prev ? { ...prev, points: [...prev.points, point] } : null);
  }, []);

  const handleStrokeEnd = useCallback(() => {
    setAllStrokes(prev => {
      if (!activeStroke) return prev;
      const updatedStrokes = [...(prev[currentIndex] || []), activeStroke];
      return { ...prev, [currentIndex]: updatedStrokes };
    });
    setActiveStroke(null);
  }, [activeStroke, currentIndex]);

  const handleUndo = () => {
    const strokesForImage = allStrokes[currentIndex] || [];
    if (strokesForImage.length === 0) return;

    const lastStroke = strokesForImage[strokesForImage.length - 1];
    
    // Mover el último trazo a la pila de rehacer
    setRedoStack(prev => ({
      ...prev,
      [currentIndex]: [...(prev[currentIndex] || []), lastStroke]
    }));

    // Eliminar el último trazo de la pila principal
    setAllStrokes(prev => ({
      ...prev,
      [currentIndex]: strokesForImage.slice(0, -1)
    }));
  };

  const handleRedo = () => {
    const redoStrokesForImage = redoStack[currentIndex] || [];
    if (redoStrokesForImage.length === 0) return;

    const strokeToRedo = redoStrokesForImage[redoStrokesForImage.length - 1];

    // Mover el trazo de vuelta a la pila principal
    setAllStrokes(prev => ({
      ...prev,
      [currentIndex]: [...(prev[currentIndex] || []), strokeToRedo]
    }));

    // Eliminar el trazo de la pila de rehacer
    setRedoStack(prev => ({
      ...prev,
      [currentIndex]: redoStrokesForImage.slice(0, -1)
    }));
  };

  const handleSave = async () => {
    const img = images[currentIndex];
    if (!img?.id) return;
    await saveAnnotationForPhoto(img.id, { strokes: currentStrokes });
    
    // Mostrar mensaje de guardado y ocultarlo después de 2 segundos
    setShowSaveMessage(true);
    setTimeout(() => {
      setShowSaveMessage(false);
    }, 2000);
  };

  const palette = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ffffff'];

  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose} animationType="fade">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Cabecera con botones */}
          <View style={[styles.header, { top: insets.top }]}>
            <Pressable style={styles.headerBtn} onPress={onClose}><Ionicons name="close" size={24} color="white" /></Pressable>
            <View style={{ flex: 1 }} />
            <Pressable style={[styles.headerBtn, annotateMode && styles.headerBtnActive]} onPress={() => setAnnotateMode(v => !v)}><Ionicons name="pencil" size={20} color="white" /></Pressable>
            <Pressable style={[styles.headerBtn, (currentStrokes.length === 0) && styles.headerBtnDisabled]} onPress={handleUndo} disabled={currentStrokes.length === 0}><Ionicons name="arrow-undo-outline" size={22} color="white" /></Pressable>
            <Pressable style={[styles.headerBtn, (currentRedoStack.length === 0) && styles.headerBtnDisabled]} onPress={handleRedo} disabled={currentRedoStack.length === 0}><Ionicons name="arrow-redo-outline" size={22} color="white" /></Pressable>
            <Pressable style={styles.headerBtn} onPress={handleSave}><Ionicons name="save-outline" size={22} color="white" /></Pressable>
          </View>

          {/* Paleta de colores */}
          {annotateMode && (
            <View style={[styles.paletteRow, { top: insets.top + 50 }]}>
              {palette.map(c => (
                <Pressable key={c} onPress={() => setColor(c)} style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]} />
              ))}
            </View>
          )}

          <PagerView style={styles.pagerView} initialPage={initialIndex} scrollEnabled={pagerEnabled} onPageSelected={e => setCurrentIndex(e.nativeEvent.position)}>
            {images.map((image, index) => (
              <ZoomableImage
                key={image.id || index}
                imageUri={image.uri}
                setPagerEnabled={setPagerEnabled}
                annotateMode={annotateMode}
                strokes={allStrokes[index] || []}
                activeStroke={index === currentIndex ? activeStroke : null}
                onStrokeStart={handleStrokeStart}
                onStrokeUpdate={handleStrokeUpdate}
                onStrokeEnd={handleStrokeEnd}
              />
            ))}
          </PagerView>

          {/* Contador de imágenes y Mensaje de Guardado */}
          <View style={[styles.footer, { bottom: insets.bottom + 20 }]}>
            {showSaveMessage ? (
              <Text style={styles.saveMessage}>¡Guardado!</Text>
            ) : (
              <Text style={styles.counter}>{`${currentIndex + 1} / ${images.length}`}</Text>
            )}
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  pagerView: { flex: 1 },
  page: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: width, height: height },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { position: 'absolute', width: '100%', flexDirection: 'row', paddingHorizontal: 20, zIndex: 10, alignItems: 'center' },
  headerBtn: { padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 30, marginLeft: 10 },
  headerBtnActive: { backgroundColor: '#007AFF' },
  headerBtnDisabled: { opacity: 0.4 },
  paletteRow: { position: 'absolute', width: '100%', flexDirection: 'row', justifyContent: 'center', zIndex: 10, paddingTop: 10 },
  colorDot: { width: 30, height: 30, borderRadius: 15, marginHorizontal: 10, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: 'white' },
  footer: { position: 'absolute', width: '100%', alignItems: 'center', zIndex: 10 },
  counter: { color: 'white', fontSize: 16, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  saveMessage: { color: '#2ed573', fontSize: 16, fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, overflow: 'hidden' },
});
