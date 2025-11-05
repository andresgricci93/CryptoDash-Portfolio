
// fetch and cache all the cryptos with tanstack query
export const fetchCryptos = async () => {

    const response = await fetch(`${import.meta.env.VITE_API_URL}/cryptos`);

    if (!response.ok) {
     throw new Error('Failed to fetch cryptos');
    }

    return response.json();


}

// function to fetch and cache a certain CryptoDetail Page Coin on Mouse Hover

export const fetchCryptoDetail = async (coinId) => {

    const response = await fetch(`${import.meta.env.VITE_API_URL}/cryptos/${coinId}`);

    if (!response.ok) {
     throw new Error('Failed to fetch cryptos');
    }

    return response.json();


}

// Dynamic data (price, volume, etc)
export const fetchCryptoDynamic = async (coinId) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/crypto/${coinId}/dynamic`
  );
  if (!response.ok) throw new Error('Failed to fetch dynamic data');
  const result = await response.json();
  return result.data; 
};

// Static data (description, links, etc)
export const fetchCryptoStatic = async (coinId) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/crypto/${coinId}/static`
  );
  if (!response.ok) throw new Error('Failed to fetch static data');
  const result = await response.json();
  return result.data; 
};

// Fetch favorites data for cache
export const fetchFavoritesDetails = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/favorites/details`,
    {credentials: 'include'}
  );
  if (!response.ok) throw new Error('Failed to fetch favorites');
  const result = await response.json();
  return result.data; 
}