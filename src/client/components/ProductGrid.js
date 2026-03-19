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

const ProductGrid = () => {
  const [allProducts, setAllProducts] = useState({ herbs: [], fruits: [] });
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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

        setAllProducts({
          herbs: data.herbs || [],
          fruits: data.fruits || [],
        });
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
    if (filter === 'herbs') {
      return allProducts.herbs;
    }

    if (filter === 'fruits') {
      return allProducts.fruits;
    }

    return [...allProducts.herbs, ...allProducts.fruits];
  }, [allProducts, filter]);

  const openLightbox = (index) => {
    setPhotoIndex(index);
    setIsLightboxOpen(true);
  };

  const getCategory = (item) => {
    return allProducts.herbs.some((herb) => herb.id === item.id) ? 'herb' : 'fruit';
  };

  const getMetaTitle = (item) => {
    return getCategory(item) === 'herb' ? 'Health benefits' : 'Uses';
  };

  const getDisplayPrice = (price) => {
    return typeof price === 'string' && price.trim() ? price : 'Contact us for current pricing';
  };

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
          const category = getCategory(item);
          const imageSrc = item.image;

          return (
            <article key={`${category}-${item.id}`} className={`product-card ${category}`}>
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
                <span className="product-badge">{category === 'herb' ? 'Herb' : 'Fruit plant'}</span>
              </button>

              <div className="product-copy">
                <h3>{item.name}</h3>
                <p className="product-description">{item.description}</p>
                <div className="product-meta">
                  <span>{getMetaTitle(item)}</span>
                  <p>{item.benefits}</p>
                </div>
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
