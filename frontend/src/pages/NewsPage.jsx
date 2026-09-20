import { useQuery } from '@tanstack/react-query';
import Header from '../components/common/Header.jsx';
import NewsDispatch from '../components/news/NewsDispatch.jsx';
import { fetchNews, newsQueryKey } from '../api/news.js';

const editionDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Rome',
  year: 'numeric'
});

const articleTimeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  hour12: false,
  minute: '2-digit',
  timeZone: 'Europe/Rome',
  timeZoneName: 'short'
});

const toNewsViewModel = (article) => ({
  ...article,
  author: article.author || article.source,
  body: [],
  category: article.categories?.slice(0, 2).join(' · ') || 'Crypto',
  publishedLabel: article.publishedAt
    ? articleTimeFormatter.format(new Date(article.publishedAt))
    : 'Time unavailable',
  summary: article.summary || article.title
});

const createEdition = (editionDate) => {
  const candidate = editionDate
    ? new Date(`${editionDate}T12:00:00.000Z`)
    : new Date();
  const date = Number.isNaN(candidate.getTime()) ? new Date() : candidate;

  return {
    dateTime: editionDate || date.toISOString().slice(0, 10),
    dateLabel: editionDateFormatter.format(date).toUpperCase(),
    label: 'DAILY EDITION'
  };
};

const PageMessage = ({ children }) => (
  <div className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center px-6 text-center text-gray-400">
    {children}
  </div>
);

const NewsPage = () => {
  const {
    data,
    error,
    isLoading,
    refetch
  } = useQuery({
    queryKey: newsQueryKey,
    queryFn: fetchNews,
    staleTime: 60 * 60 * 1000
  });
  const edition = data?.edition;
  const articles = edition?.articles || [];
  const viewArticles = articles.map(toNewsViewModel);
  const leadStory = viewArticles[0];

  if (isLoading) {
    return (
      <div className="min-h-full bg-gray-900">
        <Header title="News" />
        <PageMessage>Loading the latest crypto briefings…</PageMessage>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-gray-900">
        <Header title="News" />
        <PageMessage>
          <div className="space-y-4">
            <p>{error.message}</p>
            <button
              className="rounded border border-gray-600 px-4 py-2 text-sm text-gray-200 transition-colors hover:border-sky-400 hover:text-white"
              onClick={() => refetch()}
              type="button"
            >
              Try again
            </button>
          </div>
        </PageMessage>
      </div>
    );
  }

  if (!leadStory) {
    return (
      <div className="min-h-full bg-gray-900">
        <Header title="News" />
        <PageMessage>No crypto news is available right now.</PageMessage>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-900">
      <Header title="News" />
      <NewsDispatch
        digestStories={viewArticles.slice(1)}
        edition={createEdition(edition.editionDate)}
        leadStory={leadStory}
        sources={edition.sources || []}
      />
    </div>
  );
};

export default NewsPage;
