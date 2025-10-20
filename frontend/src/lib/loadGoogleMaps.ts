let loading: Promise<void> | null = null;

export function loadGoogleMaps() {
  if ((window as any).google?.maps) return Promise.resolve();

  if (!loading) {
    const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!key) return Promise.reject(new Error('Missing REACT_APP_GOOGLE_MAPS_API_KEY'));

    loading = new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        key
      )}&libraries=places`;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.head.appendChild(s);
    });
  }

  return loading;
}