import Navbar from './components/Navbar';
import OfferList from './components/OfferList';
import Footer from './components/Footer';
import Searcher from './components/Searcher';
import Charts from './components/Charts'
export default function App() {
  
  return (
    <div className="min-h-screen bg-black px-2">
      <Navbar />
        <Searcher />
        <Charts />
        <OfferList />
      <Footer />
    </div>
  );
}