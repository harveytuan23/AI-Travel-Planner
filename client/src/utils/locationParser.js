export function parseLocationString(locationString) {
    const cleaned = locationString.replace(/[{}]/g, '').trim();
    const arr = cleaned.split(';').filter(x => x.trim() !== '');
    if (arr.length < 2) throw new Error('需要至少兩個地點');
  
    return {
      origin: arr[0].trim(),
      destination: arr[arr.length - 1].trim(),
      waypoints: arr.slice(1, -1).map(loc => ({
        location: loc.trim(),
        stopover: true
      }))
    };
  }
  