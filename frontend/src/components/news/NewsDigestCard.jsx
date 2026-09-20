import NewsCategoryBadge from './NewsCategoryBadge.jsx';

const NewsDigestCard = ({ article }) => (
  <article className="group space-y-3 border-t border-gray-700 pt-5 md:border-t-0 md:pt-0">
    <a
      aria-label={`Read ${article.title}`}
      className="block aspect-[16/9] overflow-hidden rounded-sm bg-gray-800"
      href={article.url}
      rel="noreferrer"
      target="_blank"
    >
      {article.imageUrl ? (
        <img
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          decoding="async"
          loading="lazy"
          src={article.imageUrl}
        />
      ) : (
        <span className="flex h-full items-end bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 p-4 text-xs uppercase tracking-widest text-gray-500">
          {article.source}
        </span>
      )}
    </a>

    <div className="flex items-center justify-between gap-3">
      <NewsCategoryBadge>{article.category}</NewsCategoryBadge>
      <time
        className="whitespace-nowrap font-mono text-[10px] uppercase tracking-wide text-gray-500"
        dateTime={article.publishedAt}
      >
        {article.publishedLabel}
      </time>
    </div>

    <a
      className="block font-serif text-xl font-medium leading-snug text-white transition-[text-shadow] duration-200 group-hover:[text-shadow:0_0_12px_rgba(255,255,255,0.65)]"
      href={article.url}
      rel="noreferrer"
      target="_blank"
    >
      {article.title}
    </a>

    <p className="text-sm leading-relaxed text-gray-400">{article.summary}</p>

    <p className="text-xs text-gray-500">
      {article.source}
      {article.author ? ` · ${article.author}` : ''}
    </p>
  </article>
);

export default NewsDigestCard;
