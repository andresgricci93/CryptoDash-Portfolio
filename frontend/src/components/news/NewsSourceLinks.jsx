const SOURCE_URLS = {
  CoinDesk: 'https://www.coindesk.com/',
  CoinTelegraph: 'https://cointelegraph.com/',
  Decrypt: 'https://decrypt.co/',
};

const NewsSourceLinks = ({ sources }) => {
  const linkedSources = sources.filter((source) => SOURCE_URLS[source]);

  if (linkedSources.length === 0) return null;

  return (
    <nav
      aria-label="News sources"
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-500"
    >
      <span>News Sources:</span>
      {linkedSources.map((source) => (
        <a
          className="rounded-[3px] bg-white px-2 py-1 font-semibold text-gray-950 transition-shadow duration-200 hover:shadow-[0_0_12px_rgba(255,255,255,0.65)]"
          href={SOURCE_URLS[source]}
          key={source}
          rel="noreferrer"
          target="_blank"
        >
          {source}
        </a>
      ))}
    </nav>
  );
};

export default NewsSourceLinks;
