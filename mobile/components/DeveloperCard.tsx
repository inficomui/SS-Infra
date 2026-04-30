import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Logo = require('@/assets/Logo.png');

interface DeveloperCardProps {
    colors: any;
    isDark: boolean;
}

export default function DeveloperCard({ colors, isDark }: DeveloperCardProps) {
    const openCompanyWebsite = () => Linking.openURL('https://inficomsolutions.com/');
    const openDeveloperPortfolio = () => Linking.openURL('https://someshwarholkar.vercel.app');

    return (
        <View style={[
            styles.devCard,
            {
                backgroundColor: isDark ? '#0C1929' : '#EFF8FF',
                borderColor: colors.primary + '50',
            }
        ]}>
            {/* Card Header */}
            <View style={styles.devCardHeader}>
                <Image source={Logo} style={styles.logo} resizeMode="contain" />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.devSuperLabel, { color: colors.textMuted }]}>DEVELOPED BY</Text>
                    <Text style={[styles.devCompany, { color: colors.textMain }]}>Inficom Solutions</Text>
                </View>
                <MaterialCommunityIcons name="check-decagram" size={20} color={colors.primary} />
            </View>

            <View style={[styles.devDivider, { backgroundColor: colors.primary + '25' }]} />

            {/* Company Portfolio Row */}
            <TouchableOpacity onPress={openCompanyWebsite} style={styles.devRow} activeOpacity={0.7}>
                <MaterialCommunityIcons name="web" size={16} color={colors.primary} />
                <Text style={[styles.devRowLabel, { color: colors.textMuted }]}>Company</Text>
                <Text style={[styles.devRowValue, { color: colors.primary }]}>Inficom Solutions</Text>
                <MaterialCommunityIcons name="open-in-new" size={13} color={colors.primary} />
            </TouchableOpacity>

            {/* Developer Name Row — tappable → personal portfolio */}
            <TouchableOpacity onPress={openDeveloperPortfolio} style={styles.devRow} activeOpacity={0.7}>
                <MaterialCommunityIcons name="account-circle-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.devRowLabel, { color: colors.textMuted }]}>Developer</Text>
                <Text style={[styles.devName, { color: colors.primary }]}>Someshwar Holkar</Text>
                <MaterialCommunityIcons name="open-in-new" size={13} color={colors.primary} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    devCard: {
        borderRadius: 16,
        borderWidth: 1.5,
        padding: 18,
        marginBottom: 0,
    },
    devCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
    },
    logo: {
        width: 44,
        height: 44,
        borderRadius: 10,
    },
    devSuperLabel: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    devCompany: {
        fontSize: 16,
        fontWeight: '900',
        marginTop: 2,
    },
    devDivider: {
        height: 1,
        marginBottom: 10,
    },
    devRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 9,
    },
    devRowLabel: {
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    },
    devRowValue: {
        fontSize: 12,
        fontWeight: '700',
    },
    devName: {
        fontSize: 11,
        fontWeight: '700',
        fontStyle: 'italic',
    },
});
