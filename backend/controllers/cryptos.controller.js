


export const getAllCryptos = async (req,res) => {

    try {
        // coingecko limit the rate at 250 coins per request
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=1h,24h,7d');
    const data = await response.json();
    console.log(data);

    res.json(data);
    } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to fetch cryptos!' });
    }
}