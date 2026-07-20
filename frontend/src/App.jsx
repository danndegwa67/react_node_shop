import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      
      <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#F4F5F6' }}>
        <Navbar />
        <main className="flex-grow-1 mhenik-pattern-canvas">
        <AppRoutes />
      </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;