
export const formatDuration = (decimalHours: string | number): string => {
    let totalHours = Number(decimalHours);
    if (isNaN(totalHours)) return '0h 0m';

    let h = Math.floor(totalHours);
    let m = Math.round((totalHours - h) * 60);

    if (m === 60) {
        h += 1;
        m = 0;
    }

    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

export const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString); // Return original if invalid

    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export const resolveImageUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('file://')) return path;

    // Base storage URL
    const baseUrl = 'https://backend.ssinfrasoftware.com';
    return `${baseUrl}/storage/${path.replace(/^storage\//, '')}`;
};
