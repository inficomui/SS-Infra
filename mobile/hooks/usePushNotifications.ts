
import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRegisterPushTokenMutation } from '@/redux/apis/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '@/redux/slices/notificationSlice';
import { useRouter } from 'expo-router';

export function usePushNotifications() {
    const { notificationsEnabled } = useSelector((state: any) => state.settings);
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);

    useEffect(() => {
        // Dynamically update notification handler based on setting
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: notificationsEnabled,
                shouldPlaySound: notificationsEnabled,
                shouldSetBadge: false,
                shouldShowBanner: notificationsEnabled,
                shouldShowList: notificationsEnabled,
            }),
        });
    }, [notificationsEnabled]);
    const [devicePushToken, setDevicePushToken] = useState<string | undefined>(undefined);
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

    const dispatch = useDispatch();
    const router = useRouter();
    const [registerPushToken, { isLoading }] = useRegisterPushTokenMutation();
    const { isAuthenticated, role } = useSelector((state: any) => state.auth);

    useEffect(() => {
        // Only register if authenticated
        if (!isAuthenticated) return;

        registerForPushNotificationsAsync()
            .then(({ expoToken, deviceToken }) => {
                setExpoPushToken(expoToken);
                setDevicePushToken(deviceToken);


                if (expoToken) {
                    // Send to backend
                    registerPushToken({ pushToken: expoToken })
                        .unwrap()
                        .then(() => { })
                        .catch(() => { });
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
            const content = response.notification.request.content;

            const data = content.data;
            if (data && role) {
                const basePath = role === 'Owner' ? '/(owner)' : '/(operator)';

                // Construct a notification-like object for the details screen
                const notificationObj = {
                    id: response.notification.request.identifier,
                    title: response.notification.request.content.title,
                    body: response.notification.request.content.body,
                    type: data.type || 'info',
                    data: data,
                    createdAt: new Date().toISOString(),
                };

                router.push({
                    pathname: `${basePath}/notification-details` as any,
                    params: {
                        id: notificationObj.id,
                        notification: JSON.stringify(notificationObj)
                    }
                });
            }
        });

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, [isAuthenticated, role]);

    return {
        expoPushToken,
        devicePushToken,
        notification,
    };
}

async function registerForPushNotificationsAsync() {
    let expoToken;
    let deviceToken;

    // SDK 53+ compatibility: Remote notifications are removed from Expo Go on Android
    // We check appOwnership to avoid crashing in Expo Go
    const isExpoGo = Constants.appOwnership === 'expo';

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice && !isExpoGo) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return { expoToken: undefined, deviceToken: undefined };
        }

        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ??
                Constants?.easConfig?.projectId;

            if (projectId) {
                expoToken = (await Notifications.getExpoPushTokenAsync({
                    projectId,
                })).data;
            }
        } catch (e) {
            console.warn("getExpoPushTokenAsync failed. This is expected in Expo Go SDK 53+ or if EAS is not configured.");
        }

        try {
            deviceToken = (await Notifications.getDevicePushTokenAsync()).data;
        } catch (e) {
            // console.error("getDevicePushTokenAsync ERROR: ", e);
        }

    } else {
        if (isExpoGo) {
            console.info("Push Notifications are disabled in Expo Go (SDK 53+ Requirements). Use a development build for full functionality.");
        }
    }

    return { expoToken, deviceToken };
}
