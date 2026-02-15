
import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRegisterPushTokenMutation } from '@/redux/apis/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '@/redux/slices/notificationSlice';

// ... existing imports ...

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
    const [devicePushToken, setDevicePushToken] = useState<string | undefined>(undefined);
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

    const dispatch = useDispatch();
    const [registerPushToken, { isLoading }] = useRegisterPushTokenMutation();
    const { isAuthenticated } = useSelector((state: any) => state.auth);

    useEffect(() => {
        // Only register if authenticated
        if (!isAuthenticated) return;

        registerForPushNotificationsAsync()
            .then(({ expoToken, deviceToken }) => {
                setExpoPushToken(expoToken);
                setDevicePushToken(deviceToken);

                if (expoToken) {
                    console.log("Push Token Generated:", expoToken);
                    // Send to backend
                    registerPushToken({ pushToken: expoToken })
                        .unwrap()
                        .then(() => console.log("Push Token sent to backend successfully"))
                        .catch(err => console.log("Failed to send push token:", err));
                }
            })
            .catch((error: any) => setExpoPushToken(`${error}`));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
            // Dispatch to Redux store
            const content = notification.request.content;
            dispatch(addNotification({
                id: notification.request.identifier,
                title: content.title || 'New Notification',
                body: content.body || '',
                type: (typeof content.data?.type === 'string' ? content.data.type : 'info'),
                data: content.data,
                createdAt: new Date().toISOString(),
            }));
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
            // Handle navigation based on notification data here if needed
        });

        return () => {
            notificationListener.current && notificationListener.current.remove();
            responseListener.current && responseListener.current.remove();
        };
    }, [isAuthenticated]);

    return {
        expoPushToken,
        devicePushToken,
        notification,
    };
}

async function registerForPushNotificationsAsync() {
    let expoToken;
    let deviceToken;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return { expoToken: undefined, deviceToken: undefined };
        }

        try {
            expoToken = (await Notifications.getExpoPushTokenAsync()).data;
        } catch (e) {
            console.log("Error fetching expo token", e);
        }

        try {
            deviceToken = (await Notifications.getDevicePushTokenAsync()).data;
            console.log("Device Token (FCM):", deviceToken);
        } catch (e) {
            console.log("Error fetching device token", e);
        }

    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return { expoToken, deviceToken };
}
