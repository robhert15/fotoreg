import React from 'react';
import { Text, StyleSheet, TextInput, View, Pressable } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { addOpacity } from '@/utils/colorUtils';
import Animated, { useAnimatedStyle, useSharedValue, runOnJS, SharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { TextNote } from './ImageLightbox';

interface TextNoteViewProps {
  note: TextNote;
  scale: SharedValue<number>;
  onUpdate: (note: TextNote) => void;
  onDelete: (noteId: string) => void;
  setIsDragging: (isDragging: boolean) => void;
  trashZoneLayout: { x: number; y: number; width: number; height: number } | null;
}

export const TextNoteView = ({ note, scale, onUpdate, onDelete, setIsDragging, trashZoneLayout }: TextNoteViewProps) => {
  const [isEditing, setIsEditing] = React.useState(note.status === 'pending');
  const [text, setText] = React.useState(note.text);
  const translateX = useSharedValue(note.x);
  const translateY = useSharedValue(note.y);
  const outline = useThemeColor({}, 'outline');
  const borderColorSaved = addOpacity('#FFFFFF', 0.35);
  const borderColorPending = addOpacity('#000000', 0.25);

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      runOnJS(setIsDragging)(true);
    })
    .onChange((event) => {
      'worklet';
      translateX.value += event.changeX / scale.value;
      translateY.value += event.changeY / scale.value;
    })
    .onEnd((event) => {
      'worklet';
      let inTrashZone = false;
      if (trashZoneLayout) {
        const noteX = event.absoluteX;
        const noteY = event.absoluteY;
        const { x, y, width, height } = trashZoneLayout;

        if (noteX > x && noteX < x + width && noteY > y && noteY < y + height) {
          inTrashZone = true;
        }
      }

      if (inTrashZone) {
        runOnJS(onDelete)(note.id);
      } else {
        const updatedNote = {
          ...note,
          x: translateX.value,
          y: translateY.value,
        };
        runOnJS(onUpdate)(updatedNote);
      }

      runOnJS(setIsDragging)(false);
    });

  const tapGesture = Gesture.Tap().onStart(() => {
    'worklet';
    if (!isEditing) {
      runOnJS(setIsEditing)(true);
    }
  });

  const handleConfirm = () => {
    const updatedNote: TextNote = {
      ...note,
      text,
      status: 'saved',
      x: translateX.value,
      y: translateY.value,
    };
    onUpdate(updatedNote);
    setIsEditing(false);
  };

  const composedGesture = Gesture.Exclusive(dragGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: translateX.value,
      top: translateY.value,
      // Centramos la nota en su coordenada para que el punto (x,y) sea el centro
      transform: [{ translateX: -50 }, { translateY: -20 }], 
    };
  });

  const containerStyle = [
    styles.noteContainer,
    { borderColor: note.status === 'pending' ? borderColorPending : borderColorSaved },
    note.status === 'pending' ? styles.pending : styles.saved,
  ];

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[containerStyle, animatedStyle]}>
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            autoFocus
            multiline
          />
        ) : (
          <Text style={styles.noteText}>{note.text}</Text>
        )}
        {isEditing && (
          <Pressable style={styles.confirmButton} onPress={handleConfirm}>
            <Ionicons name="checkmark-circle" size={28} color="#2ed573" />
          </Pressable>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  noteContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    // Flat: sin sombras, con borde sutil
    borderWidth: 1,
  },
  pending: {
    backgroundColor: 'rgba(255, 140, 0, 0.85)', // Naranja más oscuro
  },
  saved: {
    backgroundColor: 'rgba(20, 20, 20, 0.75)',
  },
  noteText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  textInput: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
    minWidth: 80,
    textAlign: 'center',
  },
  confirmButton: {
    position: 'absolute',
    right: -12,
    top: -12,
    backgroundColor: 'white',
    borderRadius: 15,
  },
});
