// ✅ locationParser.js
export function parseLatLngLocationString(locationString) {
    const parts = locationString.split('|').map(p => p.trim()).filter(Boolean);
  
    if (parts.length < 2) {
      throw new Error('需要至少兩個地點');
    }
  
    const origin = parts[0].split(':')[1];
    const destination = parts[parts.length - 1].split(':')[1];
    const waypoints = parts.slice(1, parts.length - 1).map(p => ({
      location: p.split(':')[1],
      stopover: true,
    }));
  
    return { origin, destination, waypoints };
  }
  