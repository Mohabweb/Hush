import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import { useLang } from './i18n.jsx';
import { CartProvider } from './cart.jsx';

const About = lazy(() => import('./pages/About.jsx'));
const Locations = lazy(() => import('./pages/Locations.jsx'));
const Reviews = lazy(() => import('./pages/Reviews.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Legal = lazy(() => import('./pages/Legal.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const OrderStatus = lazy(() => import('./pages/OrderStatus.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));

function Loading() {
  return <div className="page-loading">…</div>;
}

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/admin/*" element={
          <Suspense fallback={<Loading />}><Admin /></Suspense>
        } />
        <Route path="*" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<Menu />} />
          <Route path="about" element={<Suspense fallback={<Loading />}><About /></Suspense>} />
          <Route path="locations" element={<Suspense fallback={<Loading />}><Locations /></Suspense>} />
          <Route path="reviews" element={<Suspense fallback={<Loading />}><Reviews /></Suspense>} />
          <Route path="contact" element={<Suspense fallback={<Loading />}><Contact /></Suspense>} />
          <Route path="cart" element={<Suspense fallback={<Loading />}><Checkout /></Suspense>} />
          <Route path="checkout" element={<Suspense fallback={<Loading />}><Checkout /></Suspense>} />
          <Route path="order" element={<Suspense fallback={<Loading />}><OrderStatus /></Suspense>} />
          <Route path="privacy" element={<Suspense fallback={<Loading />}><Legal slug="privacy" /></Suspense>} />
          <Route path="terms" element={<Suspense fallback={<Loading />}><Legal slug="terms" /></Suspense>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}

function NotFound() {
  const { t } = useLang();
  return <main className="container notfound"><h1>404</h1><p>{t.common.error}</p></main>;
}
