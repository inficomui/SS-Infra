
import { CONFIG } from "@/constants/Config";

/**
 * Resolves an image URL from a partial path or full URL.
 * Handles Laravel storage paths and full URLs.
 */
export const resolveImageUrl = (url: string | null | undefined): string | undefined => {
    if (!url || typeof url !== 'string') return undefined;

    // If it's already a full URL (http or https), use it as is
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    // If it's a data URI (base64), use it as is
    if (url.startsWith('data:image')) return url;

    // Construct the base URL from API_URL by removing /api/v1
    // Example: https://backend.com/api/v1 -> https://backend.com
    const baseUrl = CONFIG.API_URL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

    // Standardize the path: remove leading slashes
    let cleanPath = url.trim();
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);

    // Check if it already starts with 'storage/'
    // If we want to enforce /storage/ prefix, we should ensure we don't double it
    // But usually APIs return 'storage/path/to/file' or just 'path/to/file' implying storage

    // If it starts with storage/, we just append to base
    if (cleanPath.startsWith('storage/')) {
        return `${baseUrl}/${cleanPath}`;
    }

    // If it doesn't start with storage/, we assume it's inside storage
    return `${baseUrl}/storage/${cleanPath}`;
};
