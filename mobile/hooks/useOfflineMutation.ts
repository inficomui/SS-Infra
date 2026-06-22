import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addToQueue, OfflineAction } from '../redux/slices/offlineSlice';
import Toast from 'react-native-toast-message';

interface OfflineMutationOptions {
    endpoint: string;
    method: string;
    description: string;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}

export type MutationResponse = 
    | { success: true; offline: false; data: any; error?: never }
    | { success: true; offline: true; data: any; error?: never }
    | { success: false; offline: false; error: any; data?: never };

export const useOfflineMutation = () => {
    const dispatch = useAppDispatch();
    const isOnline = useAppSelector((state) => state.offline.isOnline);

    const performMutation = async (
        mutationFn: any,
        args: any,
        options: OfflineMutationOptions
    ): Promise<MutationResponse> => {
        if (isOnline) {
            try {
                let finalArgs = args;
                
                // If args is a plain object and contains file-like structures, convert to FormData
                // matching the pattern we use for identification
                if (args && typeof args === 'object' && (args.beforePhoto || args.afterPhoto || args.startMeterPhoto || args.endMeterPhoto || args.photo || args.machinePhoto || args.serviceImage || args.invoiceImage || args.readingBeforeImage || args.readingAfterImage)) {
                    const formData = new FormData();
                    Object.keys(args).forEach(key => {
                        const value = args[key];
                        if (value && typeof value === 'object' && value.uri) {
                            formData.append(key, value as any);
                        } else if (value !== undefined && value !== null) {
                            formData.append(key, value.toString());
                        }
                    });
                    finalArgs = formData;
                }

                const result = await mutationFn(finalArgs).unwrap();
                if (options.onSuccess) options.onSuccess(result);
                return { success: true, data: result, offline: false };
            } catch (error: any) {
                // If the error looks like a network error (e.g. status 'FETCH_ERROR'), we still might want to queue it
                if (error.status === 'FETCH_ERROR' || error.message?.includes('Network')) {
                    return handleOffline(args, options);
                }
                if (options.onError) options.onError(error);
                return { success: false, error, offline: false };
            }
        } else {
            return handleOffline(args, options);
        }
    };

    const handleOffline = async (args: any, options: OfflineMutationOptions): Promise<MutationResponse> => {
        const id = `off_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        const offlineAction: OfflineAction = {
            id,
            local_id: id,
            endpoint: options.endpoint,
            method: options.method,
            body: args,
            timestamp: Date.now(),
            retryCount: 0,
            description: options.description,
        };

        dispatch(addToQueue(offlineAction));
        
        Toast.show({
            type: 'info',
            text1: 'Saved Offline',
            text2: `${options.description} will be synced when you're online.`,
        });

        if (options.onSuccess) options.onSuccess({ success: true, offline: true, id });
        return { success: true, offline: true, data: { offline: true, id } };
    };

    return { performMutation, isOnline };
};
