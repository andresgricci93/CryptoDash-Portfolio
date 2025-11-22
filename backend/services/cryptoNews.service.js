import axios from 'axios';

/**
 * Fetch latest crypto news
 * @param {number} limit - Number of news items (default: 5)
 * @returns {Promise<Array>} Array of news items
 */
export const getLatestCryptoNews = async (limit = 5) => {
    try {
      const response = await axios.get(
        `https://min-api.cryptocompare.com/data/v2/news/?lang=EN`
      );
      
      if (response.data && response.data.Data) {
        const news = response.data.Data.slice(0, limit);
        
        // DEBUG: Check what the API returns
        console.log('First news item FULL DATA:');
        console.log(JSON.stringify(news[0], null, 2));
        
        return news.map(item => ({
          title: item.title,
          source: item.source,
          url: item.url,
          body: item.body,  
          published: item.published_on,
          categories: item.categories
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching crypto news:', error.message);
      return [];
    }
  };
  
  export const formatNewsForPrompt = (newsItems) => {
    if (!newsItems || newsItems.length === 0) return '';
    
    return newsItems.map((item, index) => {
      const date = new Date(item.published * 1000).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
   
      const snippet = item.body || 'No description available';
      
      return `
  ${index + 1}. ${item.title}
     Source: ${item.source} | Published: ${date}
     Content: ${snippet}
     URL: ${item.url}
  `.trim();
    }).join('\n\n');
  };