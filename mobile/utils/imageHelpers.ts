
import { CONFIG } from "@/constants/Config";

/**
 * Resolves an image URL from a partial path or full URL.
 * Handles Laravel storage paths and full URLs.
 */
export const resolveImageUrl = (url: string | null | undefined): string | undefined => {
    if (!url || typeof url !== 'string') return undefined;

    const trimmedUrl = url.trim();
    if (!trimmedUrl) return undefined;

    // If it's already a full URL (http or https), use it as is
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) return trimmedUrl;

    // If it's a data URI (base64) or local file path, use it as is
    if (trimmedUrl.startsWith('data:image') || trimmedUrl.startsWith('file://')) return trimmedUrl;

    // Construct the base URL from API_URL by removing /api/v1
    // Example: https://backend.com/api/v1 -> https://backend.com
    const baseUrl = CONFIG.API_URL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

    // Standardize the path: remove leading slashes
    let cleanPath = trimmedUrl;
    while (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
    }

    // Check if it already starts with 'storage/'
    if (cleanPath.startsWith('storage/')) {
        return `${baseUrl}/${cleanPath}`;
    }

    // Also check for 'public/storage/' which sometimes happens in Laravel
    if (cleanPath.startsWith('public/storage/')) {
        return `${baseUrl}/${cleanPath.replace('public/', '')}`;
    }

    // If it doesn't start with storage/, we assume it's inside storage
    return `${baseUrl}/storage/${cleanPath}`;
};
