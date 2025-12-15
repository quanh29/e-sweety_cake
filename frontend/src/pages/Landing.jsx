import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import Testimonial from '../components/Testimonial';
import Footer from '../components/Footer';
import PageTitle from '../components/PageTitle';

const Landing = ({ onCartClick }) => {
  return (
    <>
      <PageTitle title="Trang Chủ" />
      <Header onCartClick={onCartClick} />
      <Hero />
      <ProductGrid />
      <Testimonial />
      <Footer />
    </>
  );
};

export default Landing;
