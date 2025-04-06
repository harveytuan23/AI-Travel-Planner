let isLoaded = false;

export function loadGoogleMapsApi() {
  return new Promise((resolve, reject) => {
    if (isLoaded) {
      resolve(window.google);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isLoaded = true;
      resolve(window.google);
    };

    script.onerror = () => reject(new Error('Google Maps API 載入失敗'));

    document.body.appendChild(script);
  });
}
