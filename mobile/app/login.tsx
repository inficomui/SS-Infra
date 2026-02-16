import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator
} from 'react-native';
import { TextInput, Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/redux/slices/authSlice';
import CountryCodePicker from '@/components/ui/CountryCodePicker';
import OTPInput from '@/components/ui/OTPInput';
import { useSendOtpMutation, useVerifyOtpMutation } from '@/redux/apis/authApi';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const PRIMARY_YELLOW = '#FFD700';
const SECONDARY_YELLOW = '#FDB813';
const DEEP_BLACK = '#0F0F0F';
const CARD_BG = '#1A1A1A';
const INPUT_BG = '#252525';

export default function LoginScreen() {
    const dispatch = useDispatch();
    const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
    const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

    const [isOtpSent, setIsOtpSent] = useState(false);
    const [mobileNumber, setMobileNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [otp, setOtp] = useState('');
    const [devOtp, setDevOtp] = useState<string | null>(null);

    const handleSendOtp = async () => {
        if (mobileNumber.length < 10) {
            Toast.show({ type: 'error', text1: 'Invalid Number', text2: 'Please enter a 10-digit number.' });
            return;
        }
        try {
            const response: any = await sendOtp({ mobile: mobileNumber }).unwrap();
            console.log('Send OTP Response:', response);
            if (response?.success) {
                setIsOtpSent(true);
                if (response.devOtp) setDevOtp(response.devOtp);
                Toast.show({ type: 'success', text1: 'OTP Sent Successfully' });
            }
        } catch (error: any) {
            console.error('Send OTP Error:', error);
            const errorMessage = error?.data?.message || error?.data?.error || error?.message || "Failed to send OTP. Please try again.";
            Toast.show({
                type: 'error',
                text1: 'OTP Sending Failed',
                text2: errorMessage
            });
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length === 4) {
            Keyboard.dismiss();
            try {
                const response = await verifyOtp({ mobile: mobileNumber, otp }).unwrap();
                if (response && response.token) {
                    dispatch(setCredentials({
                        user: response.user,
                        token: response.token
                    }));
                    Toast.show({ type: 'success', text1: 'Login Successful' });
                } else {
                    Toast.show({ type: 'error', text1: 'Login Failed', text2: 'Invalid response from server' });
                }

            } catch (error: any) {
                Toast.show({ type: 'error', text1: 'Verification Failed', text2: error?.data?.message || "Invalid OTP." });
            }
        } else {
            Toast.show({ type: 'error', text1: 'Invalid OTP', text2: "Please enter a 4-digit OTP." });
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.innerView}>

                            {/* Top Branding Section */}
                            <LinearGradient colors={[PRIMARY_YELLOW, SECONDARY_YELLOW]} style={styles.headerHero}>
                                <Surface style={styles.logoCircle} elevation={5}>
                                    <MaterialCommunityIcons name="crane" size={45} style={{ color: 'yellow' }} />
                                </Surface>
                                <Text style={styles.heroTitle}>SS INFRA</Text>
                                <Text style={styles.heroSubtitle}>FLEET OPERATIONS PORTAL</Text>
                            </LinearGradient>

                            <View style={styles.formContainer}>
                                <Surface style={styles.glassCard} elevation={2}>
                                    {!isOtpSent ? (
                                        <View>
                                            <Text style={styles.formHeading}>Sign In</Text>
                                            <Text style={styles.formSubtext}>Access your fleet dashboard</Text>

                                            {/* Input 2: Mobile Number at Bottom */}
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.inputLabel}>Mobile Number</Text>
                                                <TextInput
                                                    value={mobileNumber}
                                                    onChangeText={setMobileNumber}
                                                    placeholder="96687 85545"
                                                    placeholderTextColor="#555"
                                                    keyboardType="phone-pad"
                                                    maxLength={10}
                                                    mode="flat"
                                                    style={styles.textInput}
                                                    textColor="#FFF"
                                                    underlineColor="transparent"
                                                    activeUnderlineColor={PRIMARY_YELLOW}
                                                    left={<TextInput.Icon icon="phone-outline" color={PRIMARY_YELLOW} />}
                                                />
                                            </View>

                                            <TouchableOpacity style={styles.actionButton} onPress={handleSendOtp} disabled={isSendingOtp}>
                                                <LinearGradient colors={[PRIMARY_YELLOW, SECONDARY_YELLOW]} style={styles.buttonGradient}>
                                                    {isSendingOtp ? <ActivityIndicator color={DEEP_BLACK} /> : (
                                                        <>
                                                            <Text style={styles.buttonText}>Send OTP</Text>
                                                            <MaterialCommunityIcons name="chevron-right" size={24} color={DEEP_BLACK} />
                                                        </>
                                                    )}
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View>
                                            <Text style={styles.formHeading}>Verification</Text>
                                            <Text style={styles.otpSubtext}>OTP sent to {countryCode} {mobileNumber}</Text>

                                            <OTPInput
                                                length={4}
                                                value={otp}
                                                onChange={setOtp}
                                                containerStyle={styles.otpWrapper}
                                                boxStyle={styles.otpBox}
                                                textStyle={styles.otpText}
                                            />

                                            {devOtp && (
                                                <View style={styles.devBanner}>
                                                    <Text style={styles.devText}>DEBUG CODE: {devOtp}</Text>
                                                </View>
                                            )}

                                            <TouchableOpacity style={styles.actionButton} onPress={handleVerifyOtp} disabled={isVerifyingOtp}>
                                                <LinearGradient colors={[PRIMARY_YELLOW, SECONDARY_YELLOW]} style={styles.buttonGradient}>
                                                    {isVerifyingOtp ? <ActivityIndicator color={DEEP_BLACK} /> : <Text style={styles.buttonText}>Secure Login</Text>}
                                                </LinearGradient>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => setIsOtpSent(false)} style={styles.backButton}>
                                                <Text style={styles.backButtonText}>Change Mobile Number</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </Surface>
                                <Text style={styles.protocolText}>Encrypted Infrastructure Protocol v4.2</Text>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: DEEP_BLACK },
    scrollContent: { flexGrow: 1 },
    innerView: { flex: 1 },
    headerHero: {
        height: height * 0.35,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomRightRadius: 80,
    },
    logoCircle: {
        width: 85,
        height: 85,
        borderRadius: 42,
        backgroundColor: DEEP_BLACK,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: DEEP_BLACK,
        marginTop: 15,
        letterSpacing: 1.5,
    },
    heroSubtitle: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(0,0,0,0.6)',
        letterSpacing: 2,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 25,
        marginTop: -40,
    },
    glassCard: {
        backgroundColor: CARD_BG,
        borderRadius: 30,
        padding: 30,
        borderWidth: 1,
        borderColor: '#333',
    },
    formHeading: {
        fontSize: 26,
        fontWeight: '900',
        color: PRIMARY_YELLOW,
        marginBottom: 5,
    },
    formSubtext: {
        color: '#888',
        fontSize: 14,
        marginBottom: 25,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        color: '#AAA',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    countryPickerWrapper: {
        backgroundColor: INPUT_BG,
        borderRadius: 12,
        height: 55,
        justifyContent: 'center',
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#444',
    },
    textInput: {
        backgroundColor: INPUT_BG,
        borderRadius: 12,
        height: 55,
        fontSize: 18,
        fontWeight: '700',
        borderWidth: 1,
        borderColor: '#444',
        overflow: 'hidden',
    },
    actionButton: {
        height: 55,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        color: DEEP_BLACK,
        fontWeight: '900',
        fontSize: 16,
        textTransform: 'uppercase',
    },
    otpSubtext: { color: '#888', marginBottom: 20 },
    otpWrapper: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    otpBox: {
        width: width * 0.14,
        height: 60,
        borderRadius: 12,
        backgroundColor: INPUT_BG,
        borderWidth: 2,
        borderColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpText: { fontSize: 24, fontWeight: 'bold', color: PRIMARY_YELLOW },
    devBanner: {
        backgroundColor: 'rgba(255,215,0,0.1)',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.3)',
    },
    devText: { color: PRIMARY_YELLOW, textAlign: 'center', fontWeight: 'bold', fontSize: 12 },
    backButton: { marginTop: 20, alignItems: 'center' },
    backButtonText: { color: '#666', fontSize: 13, textDecorationLine: 'underline' },
    protocolText: {
        textAlign: 'center',
        color: '#333',
        fontSize: 10,
        marginTop: 25,
        letterSpacing: 1,
    }
});