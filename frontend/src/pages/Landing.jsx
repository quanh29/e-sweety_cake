import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';

const Landing = ({ onCartClick }) => {
  return (
    <>
      <Header onCartClick={onCartClick} />
      <Hero />
      <ProductGrid />
    </>
  );
};

export default Landing;
