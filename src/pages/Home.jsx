import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title fade-in">
              Premium Dining, Delivered Excellence
            </h1>
            <p className="hero-subtitle slide-up">
              Experience culinary excellence with our carefully curated menu featuring 
              fresh, locally-sourced ingredients and innovative recipes.
            </p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <Link to="/menu" className="btn btn-primary btn-lg">
                  <i className="fas fa-utensils"></i> Browse Menu
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary btn-lg">
                    <i className="fas fa-user-plus"></i> Get Started
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    <i className="fas fa-sign-in-alt"></i> Login
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hero-image">
            <img src="/hero-image.svg" alt="Food Illustration" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title text-center">Why Choose CampusBites?</h2>
          <div className="grid grid-3">
            <div className="feature-card card">
              <div className="feature-icon">
                <i className="fas fa-award"></i>
              </div>
              <h3>Premium Quality</h3>
              <p>
                We source only the finest ingredients and prepare each dish 
                with meticulous attention to detail and culinary expertise.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <h3>Fast Delivery</h3>
              <p>
                Quick and efficient service ensuring your food arrives fresh 
                and hot, right when you need it.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <i className="fas fa-star"></i>
              </div>
              <h3>Excellence Delivered</h3>
              <p>
                From kitchen to your table, we maintain the highest standards 
                of quality, freshness, and presentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="grid grid-4">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="stat-number">5000+</h3>
              <p>Happy Customers</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-utensils"></i>
              </div>
              <h3 className="stat-number">200+</h3>
              <p>Menu Items</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-store"></i>
              </div>
              <h3 className="stat-number">20+</h3>
              <p>Canteens</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-shopping-bag"></i>
              </div>
              <h3 className="stat-number">10k+</h3>
              <p>Orders Delivered</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container text-center">
          <h2>Ready to Experience Excellence?</h2>
          <p>Join thousands of satisfied customers enjoying premium campus dining</p>
          {!isAuthenticated && (
            <Link to="/signup" className="btn btn-accent btn-lg">
              <i className="fas fa-rocket"></i> Get Started Now
            </Link>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

