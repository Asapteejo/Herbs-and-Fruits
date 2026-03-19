import React from 'react';
import ReactDOM from 'react-dom';
import ProductGrid from './components/ProductGrid';

const rootElement = document.getElementById('catalog-root');

if (rootElement) {
  ReactDOM.render(<ProductGrid />, rootElement);
}
