import React, { useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    NativeSyntheticEvent,
    TextInputKeyPressEventData,
    StyleProp,
    ViewStyle,
    TextStyle
} from 'react-native';

interface OTPInputProps {
    length: number;
    value: string;
    onChange: (code: string) => void;
    error?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    boxStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

const PRIMARY_YELLOW = '#FFD700';
const DEEP_BLACK = '#121212';
const DARK_GREY = '#1E1E1E';

const OTPInput = ({ length, value, onChange, error, containerStyle, boxStyle, textStyle }: OTPInputProps) => {
    const inputs = useRef<(TextInput | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    const handleChange = (text: string, index: number) => {
        const chars = Array(length).fill('').map((_, i) => value[i] || '');

        if (text.length > 1) {
            chars[index] = text[text.length - 1];
        } else {
            chars[index] = text;
        }

        const codeString = chars.join('');
        onChange(codeString);

        // Move to next box
        if (text && index < length - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (!value[index] && index > 0) {
                inputs.current[index - 1]?.focus();
                // Optional: Delete previous character when moving back
                const chars = value.split('');
                chars[index - 1] = '';
                onChange(chars.join(''));
            }
        }
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {Array(length).fill(0).map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.boxContainer,
                        boxStyle,
                        error && styles.errorBorder,
                        focusedIndex === i && styles.activeBorder // Highlight active box
                    ]}
                >
                    <TextInput
                        ref={ref => { inputs.current[i] = ref; }}
                        style={[styles.input, textStyle]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={value[i] || ''}
                        onChangeText={(text) => handleChange(text, i)}
                        onKeyPress={(e) => handleKeyPress(e, i)}
                        onFocus={() => setFocusedIndex(i)}
                        onBlur={() => setFocusedIndex(null)}
                        selectionColor={PRIMARY_YELLOW}
                        textAlign="center"
                        cursorColor={PRIMARY_YELLOW}
                        placeholder="-"
                        placeholderTextColor="#444"
                    />
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginVertical: 15,
    },
    boxContainer: {
        width: 58,
        height: 68,
        borderRadius: 15,
        backgroundColor: DARK_GREY, // Dark theme background
        borderWidth: 2,
        borderColor: '#333', // Subtle border
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    activeBorder: {
        borderColor: PRIMARY_YELLOW, // Industrial Yellow highlight
        backgroundColor: '#252525',
    },
    input: {
        fontSize: 28,
        fontWeight: '900', // Bold numbers
        width: '100%',
        height: '100%',
        textAlign: 'center',
        color: PRIMARY_YELLOW, // Yellow text for OTP
        padding: 0,
    },
    errorBorder: {
        borderColor: '#EF4444',
        borderWidth: 2,
    }
});

export default OTPInput;




























// import React, { useRef } from 'react';
// import { View, StyleSheet, TextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';

// interface OTPInputProps {
//     length: number;
//     value: string;
//     onChange: (code: string) => void;
//     error?: boolean;
//     containerStyle?: StyleProp<ViewStyle>;
//     boxStyle?: StyleProp<ViewStyle>;
//     textStyle?: StyleProp<TextStyle>;
// }
// import { StyleProp, ViewStyle, TextStyle } from 'react-native';

// const OTPInput = ({ length, value, onChange, error, containerStyle, boxStyle, textStyle }: OTPInputProps) => {
//     const inputs = useRef<(TextInput | null)[]>([]);

//     const handleChange = (text: string, index: number) => {
//         // Pad with spaces if needed to reach index? No, just rebuild.
//         // It's safer to reconstruct the string.
//         const chars = Array(length).fill('').map((_, i) => value[i] || '');

//         if (text.length > 1) {
//             chars[index] = text[text.length - 1];
//         } else {
//             chars[index] = text;
//         }

//         const codeString = chars.join('');
//         onChange(codeString);

//         if (text && index < length - 1) {
//             inputs.current[index + 1]?.focus();
//         }
//     };

//     const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
//         if (e.nativeEvent.key === 'Backspace') {
//             // If current input is empty, move back and delete previous
//             if (!value[index] && index > 0) {
//                 inputs.current[index - 1]?.focus();
//             }
//         }
//     };

//     return (
//         <View style={[styles.container, containerStyle]}>
//             {Array(length).fill(0).map((_, i) => (
//                 <View key={i} style={[styles.boxContainer, boxStyle, error && styles.errorBorder]}>
//                     <TextInput
//                         ref={ref => { inputs.current[i] = ref; }}
//                         style={[styles.input, textStyle]}
//                         keyboardType="number-pad"
//                         maxLength={1}
//                         value={value[i] || ''}
//                         onChangeText={(text) => handleChange(text, i)}
//                         onKeyPress={(e) => handleKeyPress(e, i)}
//                         selectionColor="blue"
//                         textAlign="center"
//                         returnKeyType={i === length - 1 ? "done" : "next"}
//                     />
//                 </View>
//             ))}
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         gap: 12,
//         marginVertical: 8,
//     },
//     boxContainer: {
//         width: 60,
//         height: 60,
//         borderRadius: 12,
//         backgroundColor: '#FFFFFF',
//         borderWidth: 2,
//         borderColor: '#E5E7EB',
//         justifyContent: 'center',
//         alignItems: 'center',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.05,
//         shadowRadius: 4,
//         elevation: 2,
//     },
//     input: {
//         fontSize: 24,
//         fontWeight: '600',
//         width: '100%',
//         height: '100%',
//         textAlign: 'center',
//         padding: 0,
//         color: '#1F2937',
//     },
//     errorBorder: {
//         borderColor: '#EF4444',
//         borderWidth: 2,
//     }
// });

// export default OTPInput;
