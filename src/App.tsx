import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Products from "./pages/Products";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Support from "./pages/Support";
import NoticeDetail from "./pages/NoticeDetail";
import Cart from "./pages/Cart";
import Order from "./pages/Order";
import PaymentResult from "./pages/PaymentResult";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import MyPage from "./pages/MyPage";
import Admin from "./pages/Admin";
import HeadquartersDashboard from "./pages/HeadquartersDashboard";
import NotFound from "./pages/NotFound";
import EmptyCart from "./pages/EmptyCart";

// Global window declarations for NICEPAY
declare global {
  interface Window {
    NICEPAY?: any;
    daum?: any;
  }
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/support" element={<Support />} />
          <Route path="/notice/:id" element={<NoticeDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/cart/empty" element={<EmptyCart />} />
          <Route path="/order" element={<Order />} />
          <Route path="/payment/result" element={<PaymentResult />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/headquarters-dashboard" element={<HeadquartersDashboard />} />
          <Route path="/admin/*" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
