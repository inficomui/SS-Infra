
import { ActivityIndicator, View } from 'react-native';

/**
 * This screen is only ever visible for a brief instant on cold start
 * before the auth-guard in _layout.tsx fires and navigates the user
 * to their role-based screen (or to /login if not authenticated).
 *
 * All routing logic lives in _layout.tsx — do NOT add redirect logic here.
 */
export default function IndexPage() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
        </View>
    );
}
