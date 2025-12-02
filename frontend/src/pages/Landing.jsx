import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';
import PageTitle from '../components/PageTitle';

const Landing = ({ onCartClick }) => {
  return (
    <>
      <PageTitle title="Trang Chủ" />
      <Header onCartClick={onCartClick} />
      <Hero />
      <ProductGrid />
      <Footer />
    </>
  );
};

export default Landing;
