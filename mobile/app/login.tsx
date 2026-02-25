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
    ActivityIndicator,
    useColorScheme
} from 'react-native';
import { TextInput, Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '@/redux/slices/authSlice';
import CountryCodePicker from '@/components/ui/CountryCodePicker';
import OTPInput from '@/components/ui/OTPInput';
import { useSendOtpMutation, useVerifyOtpMutation } from '@/redux/apis/authApi';
import Toast from 'react-native-toast-message';
import { selectThemeMode } from '@/redux/slices/themeSlice';
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
    const [verifyOtp, { isLoading: isVerifyingOtp, error: VerifyError, isError: VerifyIsError }] = useVerifyOtpMutation();

    const [isOtpSent, setIsOtpSent] = useState(false);
    const [mobileNumber, setMobileNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [otp, setOtp] = useState('');
    const [devOtp, setDevOtp] = useState<string | null>(null);

    // Theme Logic
    const deviceColorScheme = useColorScheme();
    const themeMode = useSelector(selectThemeMode);
    const isDark = themeMode === 'system' ? (deviceColorScheme === 'dark') : themeMode === 'dark';
    const themeColors = isDark ? Colors.dark : Colors.light;

    const CONTAINER_BG = themeColors.background;
    const CARD_BG = isDark ? '#1A1A1A' : '#FFFFFF';
    const INPUT_BG = isDark ? '#252525' : '#F3F4F6';
    const TEXT_PRIMARY = themeColors.text;
    const TEXT_SECONDARY = themeColors.textMuted;
    const BORDER_COLOR = themeColors.border;
    const PRIMARY_YELLOW = themeColors.primary;
    const SECONDARY_YELLOW = isDark ? '#FDB813' : '#F59E0B';
    const LOGO_BG = isDark ? '#0F0F0F' : '#FFF';
    const HERO_TEXT = isDark ? '#0F0F0F' : '#0F0F0F'; // Keep dark text on yellow gradient
    const PLACEHOLDER_TEXT = isDark ? '#555' : '#9CA3AF';

    const handleSendOtp = async () => {
        const cleanMobile = mobileNumber.replace(/[^0-9]/g, '');
        if (cleanMobile.length < 10) {
            Toast.show({ type: 'error', text1: t('auth.invalid_number'), text2: t('auth.error_10_digit') });
            return;
        }
        try {
            const response: any = await sendOtp({ mobile: cleanMobile }).unwrap();
            if (response?.success) {
                setIsOtpSent(true);
                if (response.devOtp) setDevOtp(response.devOtp);
                Toast.show({ type: 'success', text1: t('auth.otp_success') });
            }
        } catch (error: any) {
            console.error("Send OTP Catch Error:", JSON.stringify(error, null, 2));
            const errorMessage = error?.data?.message || error?.data?.error || error?.message || t('auth.otp_failed');
            Toast.show({
                type: 'error',
                text1: t('auth.otp_failed'),
                text2: errorMessage
            });
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length === 4) {
            Keyboard.dismiss();
            try {
                const cleanMobile = mobileNumber.replace(/[^0-9]/g, '');
                const response = await verifyOtp({ mobile: cleanMobile, otp }).unwrap();

                // Extract token and user, handling potential nesting
                const token = (response as any).token || (response as any).data?.token;
                const user = (response as any).user || (response as any).data?.user;

                if (token && user) {
                    dispatch(setCredentials({
                        user: user,
                        token: token
                    }));
                    Toast.show({ type: 'success', text1: t('auth.login_success') });
                } else {
                    // Show error message from backend if available, otherwise default to login_failed
                    const errorMessage = (response as any).message || (response as any).data?.message || t('common.error');
                    Toast.show({
                        type: 'error',
                        text1: t('auth.login_failed'),
                        text2: errorMessage
                    });
                }

            } catch (error: any) {
                console.error("Verify OTP Catch Error:", JSON.stringify(error, null, 2));
                const errorMessage = error?.data?.message || error?.message || t('auth.invalid_otp');
                Toast.show({
                    type: 'error',
                    text1: t('auth.verify_failed'),
                    text2: errorMessage
                });
            }
        } else {
            Toast.show({ type: 'error', text1: t('auth.invalid_otp'), text2: t('auth.error_4_digit') });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: CONTAINER_BG }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.innerView}>

                            {/* Top Branding Section */}
                            <LinearGradient colors={[PRIMARY_YELLOW, SECONDARY_YELLOW]} style={styles.headerHero}>
                                <Surface style={[styles.logoCircle, { backgroundColor: LOGO_BG }]} elevation={5}>
                                    <MaterialCommunityIcons name="crane" size={45} style={{ color: PRIMARY_YELLOW }} />
                                </Surface>
                                <Text style={[styles.heroTitle, { color: HERO_TEXT }]}>SS INFRA</Text>
                                <Text style={[styles.heroSubtitle, { color: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.7)' }]}>{t('auth.fleet_portal')}</Text>
                            </LinearGradient>

                            <View style={styles.formContainer}>
                                <Surface style={[styles.glassCard, { backgroundColor: CARD_BG, borderColor: BORDER_COLOR }]} elevation={2}>
                                    {!isOtpSent ? (
                                        <View>
                                            <Text style={[styles.formHeading, { color: PRIMARY_YELLOW }]}>{t('auth.sign_in')}</Text>
                                            <Text style={[styles.formSubtext, { color: TEXT_SECONDARY }]}>{t('auth.access_fleet')}</Text>

                                            {/* Input 2: Mobile Number at Bottom */}
                                            <View style={styles.inputGroup}>
                                                <Text style={[styles.inputLabel, { color: TEXT_SECONDARY }]}>{t('auth.mobile_number')}</Text>
                                                <TextInput
                                                    value={mobileNumber}
                                                    onChangeText={setMobileNumber}
                                                    placeholder="96687 85545"
                                                    placeholderTextColor={PLACEHOLDER_TEXT}
                                                    keyboardType="phone-pad"
                                                    maxLength={10}
                                                    mode="flat"
                                                    style={[styles.textInput, { backgroundColor: INPUT_BG, borderColor: BORDER_COLOR }]}
                                                    textColor={TEXT_PRIMARY}
                                                    underlineColor="transparent"
                                                    activeUnderlineColor={PRIMARY_YELLOW}
                                                    left={<TextInput.Icon icon="phone-outline" color={PRIMARY_YELLOW} />}
                                                />
                                            </View>

                                            <TouchableOpacity style={styles.actionButton} onPress={handleSendOtp} disabled={isSendingOtp}>
                                                <LinearGradient colors={[PRIMARY_YELLOW, SECONDARY_YELLOW]} style={styles.buttonGradient}>
                                                    {isSendingOtp ? <ActivityIndicator color={HERO_TEXT} /> : (
                                                        <>
                                                            <Text style={[styles.buttonText, { color: HERO_TEXT }]}>{t('auth.send_otp')}</Text>
                                                            <MaterialCommunityIcons name="chevron-right" size={24} color={HERO_TEXT} />
                                                        </>
                                                    )}
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View>
                                            <Text style={[styles.formHeading, { color: PRIMARY_YELLOW }]}>{t('auth.verification')}</Text>
                                            <Text style={[styles.otpSubtext, { color: TEXT_SECONDARY }]}>{t('auth.otp_sent_to')} {countryCode} {mobileNumber}</Text>

                                            <OTPInput
                                                length={4}
                                                value={otp}
                                                onChange={setOtp}
                                                containerStyle={styles.otpWrapper}
                                                boxStyle={[styles.otpBox, { backgroundColor: INPUT_BG, borderColor: BORDER_COLOR }]}
                                                textStyle={[styles.otpText, { color: PRIMARY_YELLOW }]}
                                            />

                                            {devOtp && (
                                                <View style={styles.devBanner}>
                                                    <Text style={styles.devText}>DEBUG CODE: {devOtp}</Text>
                                                </View>
                                            )}

                                            <TouchableOpacity style={styles.actionButton} onPress={handleVerifyOtp} disabled={isVerifyingOtp}>
                                                <LinearGradient colors={[PRIMARY_YELLOW, SECONDARY_YELLOW]} style={styles.buttonGradient}>
                                                    {isVerifyingOtp ? <ActivityIndicator color={HERO_TEXT} /> : <Text style={[styles.buttonText, { color: HERO_TEXT }]}>{t('auth.secure_login')}</Text>}
                                                </LinearGradient>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => setIsOtpSent(false)} style={styles.backButton}>
                                                <Text style={[styles.backButtonText, { color: TEXT_SECONDARY }]}>{t('auth.change_mobile')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </Surface>
                                <Text style={[styles.protocolText, { color: TEXT_SECONDARY }]}>{t('auth.protocol_desc')}</Text>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    innerView: { flex: 1 },
    headerHero: {
        height: height * 0.35,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomRightRadius: 80,
    },
    langToggleContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
    },
    logoCircle: {
        width: 85,
        height: 85,
        borderRadius: 42,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: '900',
        marginTop: 15,
        letterSpacing: 1.5,
    },
    heroSubtitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 25,
        marginTop: -40,
    },
    glassCard: {
        borderRadius: 30,
        padding: 30,
        borderWidth: 1,
    },
    formHeading: {
        fontSize: 26,
        fontWeight: '900',
        marginBottom: 5,
    },
    formSubtext: {
        fontSize: 14,
        marginBottom: 25,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    textInput: {
        borderRadius: 12,
        height: 55,
        fontSize: 18,
        fontWeight: '700',
        borderWidth: 1,
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
        fontWeight: '900',
        fontSize: 16,
        textTransform: 'uppercase',
    },
    otpSubtext: { marginBottom: 20 },
    otpWrapper: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    otpBox: {
        width: width * 0.14,
        height: 60,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpText: { fontSize: 24, fontWeight: 'bold' },
    devBanner: {
        backgroundColor: 'rgba(255,215,0,0.1)',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.3)',
    },
    devText: { color: '#FFD700', textAlign: 'center', fontWeight: 'bold', fontSize: 12 },
    backButton: { marginTop: 20, alignItems: 'center' },
    backButtonText: { fontSize: 13, textDecorationLine: 'underline' },
    protocolText: {
        textAlign: 'center',
        fontSize: 10,
        marginTop: 25,
        letterSpacing: 1,
    }
});