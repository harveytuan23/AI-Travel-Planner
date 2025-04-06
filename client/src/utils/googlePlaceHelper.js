export function convertLocationStringToQueries(locationString) {
    const cleaned = locationString.replace(/[{}]/g, '').trim();
    return cleaned.split(';')
      .map(item => {
        const [name, city] = item.trim().split('@');
        if (!name || !city) return null;
        return `${name.trim()} ${city.trim()}`;
      })
      .filter(Boolean);
  }
  
  // query the details of a single place
  export function fetchPlaceDetail(query, mapInstance) {
    return new Promise((resolve, reject) => {
      if (!window.google || !mapInstance) {
        reject('Google Maps not ready');
        return;
      }
  
      const service = new window.google.maps.places.PlacesService(mapInstance);
  
      service.textSearch({ query }, (results, status) => {
        if (status !== 'OK' || results.length === 0) {
          reject(`No results for: ${query}`);
          return;
        }
  
        const placeId = results[0].place_id;
  
        service.getDetails({ placeId }, (place, status) => {
          if (status !== 'OK') {
            reject(`Failed to get details for: ${query}`);
            return;
          }
  
          resolve({
            name: place.name,
            address: place.formatted_address,
            rating: place.rating,
            phone: place.formatted_phone_number,
            url: place.url,
            location: place.geometry?.location?.toJSON()
          });
        });
      });
    });
  }
  
  // integrate the batch queries
  export async function fetchAllPlaceDetailsFromRawString(locationString, mapInstance) {
    const queries = convertLocationStringToQueries(locationString);
    const results = await Promise.allSettled(
      queries.map(query => fetchPlaceDetail(query, mapInstance))
    );
  
    const fulfilled = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    const rejected = results.filter(r => r.status === 'rejected');
  
    if (rejected.length) {
      console.warn("⚠️ some places are not found:", rejected.length, "/", queries.length);
    }
  
    return fulfilled;
  }
  
  