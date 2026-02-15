
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

/*
  1. Success Toast (Green)
  2. Error Toast (Red)
  3. Warning Toast (Yellow)
  4. Info Toast (Blue)
*/

const toastConfig = {
    /*
      Overwrite 'success' type,
      by modifying the existing BaseToast component
    */
    success: (props: any) => (
        <GenericToast
            {...props}
            color="#10B981"
            icon="check-circle"
            title={props.text1 || 'Success'}
            message={props.text2}
        />
    ),
    /*
      Overwrite 'error' type,
      by modifying the existing ErrorToast component
    */
    error: (props: any) => (
        <GenericToast
            {...props}
            color="#EF4444"
            icon="alert-circle"
            title={props.text1 || 'Error'}
            message={props.text2}
        />
    ),

    info: (props: any) => (
        <GenericToast
            {...props}
            color="#3B82F6"
            icon="information"
            title={props.text1 || 'Info'}
            message={props.text2}
        />
    ),

    warning: (props: any) => (
        <GenericToast
            {...props}
            color="#FACC15"
            icon="alert"
            title={props.text1 || 'Warning'}
            message={props.text2}
        />
    )
};

const GenericToast = ({ color, icon, title, message, ...props }: any) => (
    <View style={[styles.container, { borderLeftColor: color }]}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <MaterialCommunityIcons name={icon} size={24} color="#FFF" />
        </View>
        <View style={styles.contentContainer}>
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
        {/* Optional close button if library supports onPress logic here easily, usually handled by autoHide though. */}
    </View>
);

const styles = StyleSheet.create({
    container: {
        height: 60,
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderLeftWidth: 5,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
        paddingHorizontal: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
        paddingVertical: 10,
        justifyContent: 'center'
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2
    },
    message: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500'
    }
});

export default toastConfig;
