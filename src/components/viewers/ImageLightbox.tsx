import React, { useEffect, useRef } from 'react';
import { Modal, View, Pressable, FlatList, Dimensions, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

export interface ImageLightboxProps {
  images: { uri: string }[];
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ images, imageIndex, visible, onRequestClose }) => {
  const listRef = useRef<FlatList<{ uri: string }>>(null);

  useEffect(() => {
    if (visible && listRef.current && imageIndex >= 0) {
      // Espera un frame para que la lista se monte
      requestAnimationFrame(() => {
        try {
          listRef.current?.scrollToIndex({ index: imageIndex, animated: false });
        } catch {}
      });
    }
  }, [visible, imageIndex]);

  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  const renderItem = ({ item }: { item: { uri: string } }) => (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        source={{ uri: item.uri }}
        style={{ width, height, backgroundColor: 'black' }}
        contentFit="contain"
        transition={100}
      />
    </View>
  );

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
          <Pressable onPress={onRequestClose} style={styles.closeBtn}>
            <Ionicons name="close" size={26} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }} />
        </View>
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
        />
        <View style={styles.footer}>
          <Text style={styles.counter}>{images.length > 0 ? `${imageIndex + 1} / ${images.length}` : ''}</Text>
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
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
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
