import React, { useEffect, useMemo, useState } from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { ClipLoader } from 'react-spinners';
import './ProductGrid.css';

const FILTERS = [
  { id: 'all', label: 'All plants' },
  { id: 'herbs', label: 'Herbs' },
  { id: 'fruits', label: 'Fruit plants' },
];

const QUICK_FILTERS = [
  { id: 'all', label: 'Everything' },
  { id: 'tea', label: 'Tea friendly' },
  { id: 'kitchen', label: 'Kitchen use' },
  { id: 'starter', label: 'Beginner picks' },
];

const BROWSE_ROUTE_LABELS = {
  tea: 'Showing tea picks',
  kitchen: 'Showing cooking picks',
  fruiting: 'Showing fruiting picks',
  gifting: 'Showing gifting picks',
  citrus: 'Showing citrus varieties',
  tree: 'Showing fruit trees',
  container: 'Showing container-friendly picks',
};

const TAG_MAP = {
  herb: {
    'Rosemary White': ['kitchen', 'tea', 'gifting'],
    'Rosemary Green': ['kitchen', 'tea', 'container'],
    Stevia: ['tea', 'container'],
    'Lipia Alba': ['tea', 'container'],
    'Garlic Chives': ['kitchen', 'container'],
    'Onion Chives': ['kitchen', 'container'],
    'Holy Basil': ['tea', 'container'],
    'Lemon Basil': ['kitchen', 'container'],
    'Purple Basil': ['kitchen', 'gifting'],
    Peppermint: ['tea', 'container'],
    'Chocolate Mint': ['tea', 'gifting', 'container'],
    'Apple Mint': ['tea', 'gifting', 'container'],
    Thyme: ['kitchen', 'tea', 'container'],
    Parsley: ['kitchen', 'container'],
    Cilantro: ['kitchen', 'container'],
    Oregano: ['kitchen', 'tea', 'container'],
    Dill: ['kitchen', 'container'],
    Sage: ['kitchen', 'tea', 'gifting'],
    Chives: ['kitchen', 'container'],
    Tarragon: ['kitchen', 'gifting'],
    Lavender: ['tea', 'gifting', 'container'],
    'Cherry Tomatoes': ['kitchen', 'container', 'fruiting'],
    'Curry Leaf': ['kitchen', 'container'],
    'Lemon Balm': ['tea', 'container'],
    Fennel: ['kitchen', 'tea', 'container'],
    Jasmine: ['tea', 'gifting', 'container'],
    Marjoram: ['kitchen', 'tea', 'container'],
  },
  fruit: {
    'Pineapple Mint': ['tea', 'gifting', 'container'],
    'Mayer Lemon': ['citrus', 'fruiting', 'container'],
    Lemon: ['citrus', 'fruiting', 'container'],
    'Pink Lemon': ['citrus', 'fruiting', 'gifting', 'container'],
    Lime: ['citrus', 'fruiting', 'container'],
    Orange: ['citrus', 'fruiting', 'tree'],
    'Valencia Orange': ['citrus', 'fruiting', 'tree'],
    Kumquat: ['citrus', 'fruiting', 'gifting', 'container'],
    'Mandarin Orange': ['citrus', 'fruiting', 'tree'],
    Mulberry: ['fruiting', 'tree'],
    Pomegranate: ['fruiting', 'tree', 'gifting', 'container'],
    Guava: ['fruiting', 'tree'],
    Soursop: ['fruiting', 'tree'],
    'Custard Apple': ['fruiting', 'tree', 'gifting'],
    'Sugar Apple': ['fruiting', 'tree', 'gifting'],
    Cherries: ['fruiting', 'gifting'],
    Plum: ['fruiting', 'tree'],
    'Yellow Plum': ['fruiting', 'tree', 'gifting'],
    Peach: ['fruiting', 'tree'],
    Apricot: ['fruiting', 'gifting'],
    Grapes: ['fruiting', 'container'],
    'Seeded Grapes': ['fruiting', 'container'],
    'Seedless Grapes': ['fruiting', 'container', 'gifting'],
    Banana: ['fruiting', 'container'],
  },
};

const normalizeDisplayText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/([a-z0-9])\-([a-zA-Z])/g, '$1 - $2')
    .replace(/\s-\s/g, ', ')
    .replace(/Nigeria's sun, drought/g, "Nigeria's sun and dry spells")
    .replace(/love-it-or-hate-it/g, 'polarizing')
    .replace(/price update/gi, 'current pricing')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const getCollectionSummary = (category) => {
  if (category === 'herb') {
    return 'Aromatic, useful, and suited for kitchens, teas, and everyday growing.';
  }

  return 'Fruit plants selected for home gardens, orchard starters, and productive containers.';
};

const getRouteTags = (item) => TAG_MAP[item.category]?.[item.name] || [];

const getActiveBrowseLabel = ({ filter, quickFilter, query }) => {
  if (query) {
    return `Showing results for "${query}"`;
  }

  if (quickFilter === 'tea') {
    return 'Showing tea-friendly picks';
  }

  if (quickFilter === 'kitchen') {
    return 'Showing kitchen-use picks';
  }

  if (quickFilter === 'starter') {
    return 'Showing beginner-friendly picks';
  }

  if (filter === 'herbs') {
    return 'Showing herb listings';
  }

  if (filter === 'fruits') {
    return 'Showing fruit plant listings';
  }

  return '';
};

const getQuickTags = (item) => {
  const source = `${item.description} ${item.benefits} ${item.note}`.toLowerCase();
  const tags = [];

  if (source.includes('tea') || source.includes('brew') || source.includes('calming')) {
    tags.push('Tea friendly');
  }

  if (
    source.includes('soup') ||
    source.includes('stew') ||
    source.includes('salad') ||
    source.includes('rice') ||
    source.includes('kitchen')
  ) {
    tags.push('Kitchen use');
  }

  if (
    source.includes('easy') ||
    source.includes('beginner') ||
    source.includes('forgiving') ||
    source.includes('great for')
  ) {
    tags.push('Beginner pick');
  }

  return tags.slice(0, 2);
};

const ProductGrid = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [quickFilter, setQuickFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [browseRoute, setBrowseRoute] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get('filter');
    const quickParam = params.get('quick');
    const queryParam = params.get('query');
    const browseParam = params.get('browse');

    if (filterParam && FILTERS.some((option) => option.id === filterParam)) {
      setFilter(filterParam);
    }

    if (quickParam && QUICK_FILTERS.some((option) => option.id === quickParam)) {
      setQuickFilter(quickParam);
    }

    if (queryParam) {
      setQuery(queryParam);
    }

    if (browseParam && BROWSE_ROUTE_LABELS[browseParam]) {
      setBrowseRoute(browseParam);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetch('/products.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load products (${response.status})`);
        }

        return response.json();
      })
      .then((data) => {
        if (!isMounted) {
          return;
        }

        const herbs = (data.herbs || []).map((item) => ({
          ...item,
          category: 'herb',
          description: normalizeDisplayText(item.description),
          benefits: normalizeDisplayText(item.benefits),
          note: normalizeDisplayText(item.alert),
        }));
        const fruits = (data.fruits || []).map((item) => ({
          ...item,
          category: 'fruit',
          description: normalizeDisplayText(item.description),
          benefits: normalizeDisplayText(item.benefits),
          note: normalizeDisplayText(item.alert),
        }));

        setAllProducts([...herbs, ...fruits]);
        setError('');
      })
      .catch((fetchError) => {
        if (isMounted) {
          setError(fetchError.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (filter === 'herbs') {
      return allProducts
        .filter((item) => item.category === 'herb')
        .filter((item) => applyBrowseRoute(item, browseRoute))
        .filter((item) => applyQuickFilter(item, quickFilter))
        .filter((item) => matchesQuery(item, normalizedQuery));
    }

    if (filter === 'fruits') {
      return allProducts
        .filter((item) => item.category === 'fruit')
        .filter((item) => applyBrowseRoute(item, browseRoute))
        .filter((item) => applyQuickFilter(item, quickFilter))
        .filter((item) => matchesQuery(item, normalizedQuery));
    }

    return allProducts
      .filter((item) => applyBrowseRoute(item, browseRoute))
      .filter((item) => applyQuickFilter(item, quickFilter))
      .filter((item) => matchesQuery(item, normalizedQuery));
  }, [allProducts, browseRoute, filter, quickFilter, query]);

  const activeBrowseLabel = getActiveBrowseLabel({
    filter,
    quickFilter,
    query: query.trim(),
  });
  const activeRouteLabel = browseRoute ? BROWSE_ROUTE_LABELS[browseRoute] : '';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (filter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', filter);
    }

    if (quickFilter === 'all') {
      params.delete('quick');
    } else {
      params.set('quick', quickFilter);
    }

    if (browseRoute) {
      params.set('browse', browseRoute);
    } else {
      params.delete('browse');
    }

    if (query.trim()) {
      params.set('query', query.trim());
    } else {
      params.delete('query');
    }

    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`;
    window.history.replaceState({}, '', nextUrl);
  }, [browseRoute, filter, quickFilter, query]);

  const openLightbox = (index) => {
    setPhotoIndex(index);
    setIsLightboxOpen(true);
  };

  const getMetaTitle = (item) => {
    return item.category === 'herb' ? 'Health benefits' : 'Best use';
  };

  const getDisplayPrice = (price) => {
    return typeof price === 'string' && price.trim()
      ? normalizeDisplayText(price)
      : 'Contact us for current pricing';
  };

  const totalHerbs = allProducts.filter((item) => item.category === 'herb').length;
  const totalFruits = allProducts.filter((item) => item.category === 'fruit').length;

  const activeCollectionSummary =
    filter === 'all'
      ? 'Browse the full collection, then narrow down by category, use case, or plant name.'
      : getCollectionSummary(filter === 'herbs' ? 'herb' : 'fruit');

  if (loading) {
    return (
      <div className="catalog-state">
        <ClipLoader color="#2d5b43" loading size={52} />
      </div>
    );
  }

  if (error) {
    return <p className="catalog-message">Error loading products: {error}</p>;
  }

  if (!filteredProducts.length) {
    return <p className="catalog-message">No products are available in this category right now.</p>;
  }

  return (
    <div className="catalog-shell">
      <div className="catalog-toolbar">
        <div className="catalog-overview">
          <p className="catalog-kicker">Browse with more control</p>
          <h2>Find the right plant faster.</h2>
          <p>{activeCollectionSummary}</p>
          {activeRouteLabel ? <p className="catalog-active-label">{activeRouteLabel}</p> : null}
          {!activeRouteLabel && activeBrowseLabel ? <p className="catalog-active-label">{activeBrowseLabel}</p> : null}
        </div>
        <div className="catalog-stats" aria-label="Catalog counts">
          <div className="catalog-stat">
            <strong>{allProducts.length}</strong>
            <span>Total listings</span>
          </div>
          <div className="catalog-stat">
            <strong>{totalHerbs}</strong>
            <span>Herbs</span>
          </div>
          <div className="catalog-stat">
            <strong>{totalFruits}</strong>
            <span>Fruit plants</span>
          </div>
        </div>
      </div>

      <div className="catalog-controls">
        <label className="catalog-search">
          <span className="sr-only">Search products</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, use, or benefit"
          />
        </label>

        <div className="quick-filter-bar" role="tablist" aria-label="Quick catalog filters">
          {QUICK_FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={quickFilter === option.id ? 'is-active' : ''}
              onClick={() => setQuickFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-bar" role="tablist" aria-label="Catalog filters">
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={filter === option.id ? 'is-active' : ''}
            onClick={() => setFilter(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filteredProducts.map((item, index) => {
          const imageSrc = item.image;
          const quickTags = getQuickTags(item);

          return (
            <article key={`${item.category}-${item.id}`} className={`product-card ${item.category}`}>
              <button
                type="button"
                className="card-image-button"
                onClick={() => openLightbox(index)}
                aria-label={`Open image for ${item.name}`}
              >
                <img
                  src={imageSrc}
                  alt={item.name}
                  className="product-image"
                  loading="lazy"
                />
                <span className="product-badge">{item.category === 'herb' ? 'Herb' : 'Fruit plant'}</span>
              </button>

              <div className="product-copy">
                <div className="product-header">
                  <p className="product-category">{item.category === 'herb' ? 'Herb collection' : 'Fruit collection'}</p>
                  {quickTags.length > 0 && (
                    <div className="tag-row">
                      {quickTags.map((tag) => (
                        <span key={tag} className="tag-chip">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <h3>{item.name}</h3>
                <p className="product-description">{item.description}</p>
                <div className="product-meta">
                  <span>{getMetaTitle(item)}</span>
                  <p>{item.benefits}</p>
                </div>
                {item.note && (
                  <div className="product-note">
                    <span>Why it stands out</span>
                    <p>{item.note}</p>
                  </div>
                )}
                <div className="product-footer">
                  <p className="price">{getDisplayPrice(item.price)}</p>
                  <a
                    className="enquiry-link"
                    href={`https://wa.me/2347064440604?text=${encodeURIComponent(`Hello, I want to ask about ${item.name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ask about this plant
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {isLightboxOpen && filteredProducts.length > 0 && (
        <Lightbox
          mainSrc={filteredProducts[photoIndex].image}
          nextSrc={filteredProducts[(photoIndex + 1) % filteredProducts.length].image}
          prevSrc={filteredProducts[(photoIndex + filteredProducts.length - 1) % filteredProducts.length].image}
          onCloseRequest={() => setIsLightboxOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex((photoIndex + filteredProducts.length - 1) % filteredProducts.length)
          }
          onMoveNextRequest={() =>
            setPhotoIndex((photoIndex + 1) % filteredProducts.length)
          }
        />
      )}
    </div>
  );
};

export default ProductGrid;

function applyQuickFilter(item, quickFilter) {
  if (quickFilter === 'all') {
    return true;
  }

  const source = `${item.description} ${item.benefits} ${item.note}`.toLowerCase();

  if (quickFilter === 'tea') {
    return source.includes('tea') || source.includes('brew') || source.includes('calming');
  }

  if (quickFilter === 'kitchen') {
    return (
      source.includes('soup') ||
      source.includes('stew') ||
      source.includes('salad') ||
      source.includes('rice') ||
      source.includes('sauce')
    );
  }

  if (quickFilter === 'starter') {
    return (
      source.includes('easy') ||
      source.includes('great for') ||
      source.includes('perfect for') ||
      source.includes('forgiving')
    );
  }

  return true;
}

function applyBrowseRoute(item, browseRoute) {
  if (!browseRoute) {
    return true;
  }

  return getRouteTags(item).includes(browseRoute);
}

function matchesQuery(item, query) {
  if (!query) {
    return true;
  }

  const haystack = `${item.name} ${item.description} ${item.benefits} ${item.note}`.toLowerCase();
  return haystack.includes(query);
}
