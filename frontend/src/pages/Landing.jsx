import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';

const Landing = ({ onCartClick }) => {
  return (
    <>
      <Header onCartClick={onCartClick} />
      <Hero />
      <ProductGrid />
      <Footer />
    </>
  );
};

export default Landing;
