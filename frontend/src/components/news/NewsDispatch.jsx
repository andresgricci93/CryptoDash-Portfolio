import NewsCategoryBadge from './NewsCategoryBadge.jsx';
import NewsDigestCard from './NewsDigestCard.jsx';
import NewsSourceLinks from './NewsSourceLinks.jsx';

const NewsDispatch = ({ edition, leadStory, digestStories, sources }) => (
  <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
    <header className="border-b border-gray-700 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-gray-400">
          <time className="font-semibold text-gray-200" dateTime={edition.dateTime}>
            {edition.dateLabel}
          </time>
          <span aria-hidden="true" className="text-gray-600">/</span>
          <span>{edition.label}</span>
        </div>
        <NewsSourceLinks sources={sources} />
      </div>
    </header>

    <article className="space-y-7 border-b border-gray-700 py-10">
      <a
        aria-label={`Read ${leadStory.title}`}
        className="block aspect-[16/7] max-h-[440px] overflow-hidden rounded-sm bg-gray-800"
        href={leadStory.url}
        rel="noreferrer"
        target="_blank"
      >
        {leadStory.imageUrl ? (
          <img
            alt=""
            className="h-full w-full object-cover"
            decoding="async"
            fetchPriority="high"
            src={leadStory.imageUrl}
          />
        ) : (
          <span className="flex h-full items-end bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 p-6 text-sm uppercase tracking-widest text-gray-500">
            {leadStory.source}
          </span>
        )}
      </a>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <NewsCategoryBadge>Lead briefing</NewsCategoryBadge>
          <span aria-hidden="true">•</span>
          <span>{leadStory.category}</span>
        </div>

        <a
          className="block max-w-5xl font-serif text-3xl font-normal leading-[1.12] tracking-tight text-white transition-[text-shadow] duration-200 hover:[text-shadow:0_0_14px_rgba(255,255,255,0.65)] sm:text-4xl lg:text-5xl"
          href={leadStory.url}
          rel="noreferrer"
          target="_blank"
        >
          {leadStory.title}
        </a>

        <p className="max-w-4xl text-base font-light leading-relaxed text-gray-300 sm:text-lg">
          {leadStory.summary}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-medium text-gray-200">{leadStory.author}</span>
          <span aria-hidden="true" className="text-gray-600">•</span>
          <span>{leadStory.source}</span>
          <span aria-hidden="true" className="text-gray-600">•</span>
          <time dateTime={leadStory.publishedAt}>{leadStory.publishedLabel}</time>
        </div>
      </div>

      {leadStory.body?.length > 0 ? (
        <div className="grid gap-8 pt-2 md:grid-cols-12">
          <div className="space-y-4 text-sm leading-relaxed text-gray-300 md:col-span-8">
            {leadStory.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {leadStory.pullQuote ? (
            <blockquote className="border-l border-gray-700 pl-6 font-serif text-lg italic leading-snug text-gray-200 md:col-span-4">
              “{leadStory.pullQuote}”
            </blockquote>
          ) : null}
        </div>
      ) : null}
    </article>

    <section aria-label="Latest crypto stories" className="grid gap-8 py-10 md:grid-cols-3">
      {digestStories.map((article) => (
        <NewsDigestCard article={article} key={article.id} />
      ))}
    </section>
  </main>
);

export default NewsDispatch;
