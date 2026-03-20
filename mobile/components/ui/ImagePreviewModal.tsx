import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Image, Dimensions, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ImagePreviewModalProps {
    visible: boolean;
    imageUrl: string | null | undefined;
    onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export default function ImagePreviewModal({ visible, imageUrl, onClose }: ImagePreviewModalProps) {
    if (!imageUrl) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <Pressable style={styles.backdrop} onPress={onClose}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)' }]} />
                </Pressable>
                
                <View style={styles.closeBtnContainer}>
                    <TouchableOpacity onPress={onClose} style={styles.closeIconButton}>
                        <MaterialCommunityIcons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.fullImage}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    closeBtnContainer: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
    },
    closeIconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: width,
        height: height * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
});
