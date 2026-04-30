import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setOnlineStatus, removeFromQueue, incrementRetryCount, OfflineAction } from '../redux/slices/offlineSlice';
import { setPrepareData } from '../redux/slices/cacheSlice';
import { CONFIG } from '../constants/Config';
import Toast from 'react-native-toast-message';
import { CloudUpload, CloudOff, Wifi, WifiOff, CheckCircle2 } from 'lucide-react-native';
import { useGetPrepareDataQuery } from '../redux/apis/workApi';
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const SyncManager: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isOnline, queue } = useAppSelector((state) => state.offline);
    const { token } = useAppSelector((state) => state.auth);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncedCount, setSyncedCount] = useState(0);
    const [totalToSync, setTotalToSync] = useState(0);

    // Initial Preparation logic: Fetch latest data when online
    const { data: prepareData, refetch: refetchPrepare } = useGetPrepareDataQuery(undefined, {
        skip: !isOnline || !token,
    });

    useEffect(() => {
        if (prepareData && prepareData.success) {
            dispatch(setPrepareData({
                machines: prepareData.machines,
                clients: prepareData.clients
            }));
        }
    }, [prepareData]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            // isInternetReachable can be null on initial load or transition. 
            // Fallback to isConnected if isInternetReachable is null.
            const online = !!state.isConnected && (state.isInternetReachable !== false);
            
            if (online !== isOnline) {
                dispatch(setOnlineStatus(online));
                if (online && token) {
                    // RTK Query will automatically fetch because skip: !isOnline changes
                    Toast.show({
                        type: 'success',
                        text1: 'You are back online!',
                        text2: 'Syncing your offline data...',
                    });
                } else if (!online) {
                    Toast.show({
                        type: 'info',
                        text1: 'You are offline',
                        text2: 'Actions will be queued and synced later.',
                    });
                }
            }
        });

        return () => unsubscribe();
    }, [isOnline, dispatch, token]);

    useEffect(() => {
        if (isOnline && queue.length > 0 && !isSyncing && token) {
            processQueue();
        }
    }, [isOnline, queue, isSyncing, token]);

    const processQueue = async () => {
        setIsSyncing(true);
        const actionsToProcess = [...queue].sort((a, b) => a.timestamp - b.timestamp);
        setTotalToSync(actionsToProcess.length);
        setSyncedCount(0);

        for (const action of actionsToProcess) {
            try {
                const result = await syncAction(action);
                if (result.success) {
                    dispatch(removeFromQueue(action.id));
                    setSyncedCount(prev => prev + 1);
                } else if (result.status === 401) {
                    setIsSyncing(false);
                    return;
                } else {
                    dispatch(incrementRetryCount(action.id));
                }
            } catch (error) {
                console.error(`Sync failed for action ${action.id}:`, error);
                dispatch(incrementRetryCount(action.id));
            }
        }
        
        // Reset after a brief delay if finished
        setTimeout(() => {
            setIsSyncing(false);
            setTotalToSync(0);
            setSyncedCount(0);
        }, 2000);
    };

    const syncAction = async (action: OfflineAction): Promise<{ success: boolean; status?: number }> => {
        try {
            const url = `${CONFIG.API_URL}${action.endpoint}`;
            const headers: Record<string, string> = {
                ...action.headers,
            };

            if (token) {
                headers['authorization'] = `Bearer ${token}`;
            }

            // Reconstruct body
            let body: any = action.body;
            let finalHeaders = headers;

            // Identification of multipart requests
            const photoKeys = [
                'beforePhoto', 'afterPhoto', 'startMeterPhoto', 'endMeterPhoto', 
                'before_photo', 'after_photo', 'start_meter_photo', 'end_meter_photo',
                'reading_before_image', 'reading_after_image', 'serviceImage', 'invoiceImage', 'photo',
                'machinePhoto', 'machine_photo', 'profile_photo', 'photo_url', 'signature',
                'id_card_front', 'id_card_back', 'meter_photo'
            ];
            
            const hasPhotos = body && typeof body === 'object' && photoKeys.some(key => body[key]);

            if (hasPhotos) {
                const formData = new FormData();
                Object.keys(body).forEach(key => {
                    const value = body[key];
                    if (value && typeof value === 'object' && value.uri) {
                        formData.append(key, value as any);
                    } else if (value !== undefined && value !== null) {
                        formData.append(key, value.toString());
                    }
                });
                
                if (action.local_id) {
                    formData.append('local_id', action.local_id);
                }
                
                body = formData;
            } else {
                headers['Content-Type'] = 'application/json';
                const finalBody = { ...body };
                if (action.local_id) {
                    finalBody.local_id = action.local_id;
                }
                body = JSON.stringify(finalBody);
            }

            const response = await fetch(url, {
                method: action.method,
                headers: finalHeaders,
                body: body,
            });

            if (response.status === 401) return { success: false, status: 401 };

            const data = await response.json();
            return { success: response.ok && (data.success !== false), status: response.status };
        } catch (error) {
            console.error('Fetch error during sync:', error);
            return { success: false };
        }
    };

    if (queue.length === 0 && isOnline && !isSyncing) return null;

    const progress = totalToSync > 0 ? (syncedCount / totalToSync) * 100 : 0;

    return (
        <Animated.View 
            entering={FadeInUp} 
            exiting={FadeOutUp}
            layout={LinearTransition}
            style={[styles.container, !isOnline && styles.offlineBanner]}
        >
            <LinearGradient
                colors={!isOnline ? ['#ef4444', '#dc2626'] : (isSyncing ? ['#0284c7', '#0369a1'] : ['#f59e0b', '#d97706'])}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            />
            <View style={styles.content}>
                {!isOnline ? (
                    <>
                        <WifiOff color="white" size={16} />
                        <Text style={styles.text}>Offline Mode Active</Text>
                    </>
                ) : (
                    <>
                        {isSyncing ? <CloudUpload color="white" size={16} /> : <CheckCircle2 color="white" size={16} />}
                        <Text style={styles.text}>
                            {isSyncing 
                                ? `Syncing data... (${syncedCount}/${totalToSync})` 
                                : `${queue.length} items pending sync`}
                        </Text>
                    </>
                )}
            </View>
            {isSyncing && totalToSync > 0 && (
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: Platform.OS === 'ios' ? 50 : 30, // Account for status bar
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    offlineBanner: {
        backgroundColor: '#ef4444', 
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    text: {
        color: 'white',
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    progressBarContainer: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        marginTop: 6,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 2,
    }
});

export default SyncManager;
