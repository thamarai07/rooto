'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Check, X, Loader2, AlertCircle } from 'lucide-react';
import Header from "@/components/header"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  price: number;
  price_per_kg: number;
  discount_percent: number;
  unit: 'kg' | 'piece' | 'pieces' | 'pack' | 'bundle' | 'gram' | 'grams';
  min_quantity: number;
  max_quantity: number;
  image: string;
  description: string;
  stock: number;
  is_featured: number;
  is_active: number;
  in_stock: boolean;
  low_stock: boolean;
  out_of_stock: boolean;
  thumbnail: string;
  url: string;
  view_count: number;
  rating: number;
  review_count: number;
  final_price: number;
}

interface CartItem {
  product: Product;
  selectedUnit: 'kg' | 'piece' | 'pieces' | 'pack' | 'bundle' | 'gram' | 'grams';
  quantity: number;
  quantityDisplay: string; // "4 Pieces", "1 KG", "500 g"
}

interface Category {
  id: number;
  name: string;
  emoji: string;
}

// ============================================================================
// MOCK DATA - Replace with real API calls later
// ============================================================================

const MOCK_PRODUCTS: Product[] = [
  {
    id: 12,
    name: 'Pomegranate',
    slug: 'pomegranate',
    category: 'Fresh Fruits',
    price: 210,
    price_per_kg: 350,
    discount_percent: 0,
    unit: 'kg',
    min_quantity: 0.25,
    max_quantity: 0,
    image: 'https://seashell-skunk-617240.hostingersite.com/vfs-admin/assets/images/uploads/product_1783233664.jpg',
    description: 'Rich in antioxidants, fiber, and vitamin C. Farm-fresh quality.',
    stock: 20,
    is_featured: 0,
    is_active: 1,
    in_stock: true,
    low_stock: false,
    out_of_stock: false,
    thumbnail: 'https://seashell-skunk-617240.hostingersite.com/vfs-admin/assets/images/uploads/product_1783233664.jpg',
    url: '/product/pomegranate',
    view_count: 2156,
    rating: 4.6,
    review_count: 194,
    final_price: 350,
  },
  {
    id: 10,
    name: 'Indian Blackberry',
    slug: 'indian-blackberry',
    category: 'Fresh Fruits',
    price: 200,
    price_per_kg: 220,
    discount_percent: 0,
    unit: 'kg',
    min_quantity: 0.25,
    max_quantity: 0,
    image: 'https://seashell-skunk-617240.hostingersite.com/vfs-admin/assets/images/uploads/product_1783233079.jpg',
    description: 'Bold, juicy, and naturally nutritious – perfect for a healthy snack.',
    stock: 20,
    is_featured: 0,
    is_active: 1,
    in_stock: true,
    low_stock: false,
    out_of_stock: false,
    thumbnail: 'https://seashell-skunk-617240.hostingersite.com/vfs-admin/assets/images/uploads/product_1783233079.jpg',
    url: '/product/indian-blackberry',
    view_count: 1252,
    rating: 4.2,
    review_count: 353,
    final_price: 220,
  },
  {
    id: 9,
    name: 'Fresh Jackfruit',
    slug: 'fresh-jackfruit',
    category: 'Fresh Fruits',
    price: 79.99,
    price_per_kg: 200,
    discount_percent: 0,
    unit: 'kg',
    min_quantity: 0.25,
    max_quantity: 0,
    image: 'https://seashell-skunk-617240.hostingersite.com/vfs-admin/assets/images/uploads/product_1776582021.webp',
    description: 'Sweet, tropical, and nutrient-rich – a delicious natural energy boost.',
    stock: 30,
    is_featured: 0,
    is_active: 1,
    in_stock: true,
    low_stock: false,
    out_of_stock: false,
    thumbnail: 'https://seashell-skunk-617240.hostingersite.com/vfs-admin/assets/images/uploads/product_1776582021.webp',
    url: '/product/fresh-jackfruit',
    view_count: 721,
    rating: 4.1,
    review_count: 345,
    final_price: 200,
  },
  {
    id: 8,
    name: 'Red Banana',
    slug: 'red-banana',
    category: 'Fresh Fruits',
    price: 80,
    price_per_kg: 80,
    discount_percent: 0,
    unit: 'pieces',
    min_quantity: 1,
    max_quantity: 0,
    image: 'https://seashell-skunk-617240.hostingersite.com/vfs-admin/assets/images/uploads/product_1776581910.jpg',
    description: 'Sweet, creamy, and nutrient-rich – a perfect energy-boosting snack.',
    stock: 1,
    is_featured: 0,
    is_active: 1,
    in_stock: true,
    low_stock: true,
    out_of_stock: false,
    thumbnail: 'https://seashell-skunk-617240.hostingersite.com/vfs-admin/assets/images/uploads/product_1776581910.jpg',
    url: '/product/red-banana',
    view_count: 970,
    rating: 4,
    review_count: 48,
    final_price: 80,
  },
  {
    id: 6,
    name: 'Papaya',
    slug: 'papaya',
    category: 'Fresh Fruits',
    price: 80,
    price_per_kg: 70,
    discount_percent: 0,
    unit: 'kg',
    min_quantity: 0.25,
    max_quantity: 0,
    image: 'https://seashell-skunk-617240.hostingersite.com/vfs-admin/assets/images/uploads/product_1776581580.webp',
    description: 'Soft, sweet, and rich in nutrients – perfect for digestion and daily health.',
    stock: 9,
    is_featured: 0,
    is_active: 1,
    in_stock: true,
    low_stock: true,
    out_of_stock: false,
    thumbnail: 'https://seashell-skunk-617240.hostingersite.com/vfs-admin/assets/images/uploads/product_1776581580.webp',
    url: '/product/papaya',
    view_count: 738,
    rating: 4.8,
    review_count: 218,
    final_price: 70,
  },
  {
    id: 5,
    name: 'Orange',
    slug: 'orange',
    category: 'Fresh Fruits',
    price: 70,
    price_per_kg: 240,
    discount_percent: 0,
    unit: 'kg',
    min_quantity: 0.25,
    max_quantity: 0,
    image: 'https://seashell-skunk-617240.hostingersite.com/vfs-admin/assets/images/uploads/product_1776581469.jpg',
    description: 'Juicy, sweet, and rich in Vitamin C – perfect for refreshing snacks and fresh juices.',
    stock: 9,
    is_featured: 0,
    is_active: 1,
    in_stock: true,
    low_stock: true,
    out_of_stock: false,
    thumbnail: 'https://seashell-skunk-617240.hostingersite.com/vfs-admin/assets/images/uploads/product_1776581469.jpg',
    url: '/product/orange',
    view_count: 391,
    rating: 4.1,
    review_count: 96,
    final_price: 240,
  },
  {
    id: 4,
    name: 'Apple',
    slug: 'apple',
    category: 'Fresh Fruits',
    price: 210,
    price_per_kg: 300,
    discount_percent: 0,
    unit: 'kg',
    min_quantity: 0.25,
    max_quantity: 0,
    image: 'https://seashell-skunk-617240.hostingersite.com/vfs-admin/assets/images/uploads/product_1776581384.webp',
    description: 'Fresh, juicy, and naturally sweet apples packed with nutrients – perfect for a healthy everyday snack.',
    stock: 10,
    is_featured: 0,
    is_active: 1,
    in_stock: true,
    low_stock: true,
    out_of_stock: false,
    thumbnail: 'https://seashell-skunk-617240.hostingersite.com/vfs-admin/assets/images/uploads/product_1776581384.webp',
    url: '/product/apple',
    view_count: 1018,
    rating: 4.8,
    review_count: 157,
    final_price: 300,
  },
];

const CATEGORIES: Category[] = [
  { id: 1, name: 'All', emoji: '🛒' },
  { id: 2, name: 'Fresh Fruits', emoji: '🍎' },
  { id: 3, name: 'Vethalai & Pakku', emoji: '🍃' },
  { id: 4, name: 'Flowers', emoji: '🌸' },
  { id: 5, name: 'Pooja Essentials', emoji: '🪔' },
  { id: 6, name: 'Krishna Jayanthi Specials', emoji: '✨' },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getUnitLabel = (unit: string): string => {
  const labels: Record<string, string> = {
    kg: 'KG',
    g: 'Grams',
    grams: 'Grams',
    piece: 'Piece',
    pieces: 'Pieces',
    pack: 'Pack',
    bundle: 'Bundle',
  };
  return labels[unit] || unit.toUpperCase();
};

const formatQuantityDisplay = (quantity: number, unit: string): string => {
  const unitLabel = getUnitLabel(unit);
  if (unit === 'kg' || unit === 'g' || unit === 'grams') {
    if (quantity < 1) return `${Math.round(quantity * 1000)} g`;
    return `${quantity} ${unitLabel}`;
  }
  return `${quantity} ${unitLabel}`;
};

const calculatePrice = (product: Product, quantity: number, unit: string): number => {
  if (unit === 'kg' || unit === 'g' || unit === 'grams') {
    return product.price_per_kg * quantity;
  }
  return product.final_price * quantity;
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface MeasurementSelectorProps {
  product: Product;
  selectedUnit: string;
  onSelect: (unit: string) => void;
}

const MeasurementSelector: React.FC<MeasurementSelectorProps> = ({ product, selectedUnit, onSelect }) => {
  const units = ['kg', 'pieces'];

  return (
    <div className="flex gap-2 mb-3">
      {units.map((unit) => {
        const isSelected = selectedUnit === unit;
        return (
          <button
            key={unit}
            onClick={() => onSelect(unit)}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
              isSelected
                ? 'bg-emerald-700 text-white border-2 border-emerald-700 shadow-md scale-105'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-400 hover:text-emerald-700'
            }`}
            aria-label={`Select ${getUnitLabel(unit)}`}
            aria-pressed={isSelected}
          >
            {isSelected && <Check className="w-4 h-4" />}
            <span>{getUnitLabel(unit)}</span>
          </button>
        );
      })}
    </div>
  );
};

interface QuantityControlProps {
  quantity: number;
  unit: string;
  onQuantityChange: (quantity: number) => void;
  minQuantity: number;
  onAddToCart: () => void;
  isAdded: boolean;
}

const QuantityControl: React.FC<QuantityControlProps> = ({
  quantity,
  unit,
  onQuantityChange,
  minQuantity,
  onAddToCart,
  isAdded,
}) => {
  const isWeightBased = ['kg', 'g', 'grams'].includes(unit);

  const handleDecrease = () => {
    const newQuantity = isWeightBased 
      ? Math.max(minQuantity, quantity - 0.25) 
      : Math.max(0, quantity - 1); // Allow 0 for pieces
    onQuantityChange(newQuantity);
  };

  const handleIncrease = () => {
    const step = isWeightBased ? 0.25 : 1;
    onQuantityChange(quantity + step);
  };

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
        <button
          onClick={handleDecrease}
          className="flex-1 py-2 px-3 rounded bg-white border border-gray-200 hover:bg-gray-50 transition text-gray-700 font-semibold text-sm"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <div className="flex-1 text-center">
          <div className="font-bold text-gray-900">
            {formatQuantityDisplay(quantity, unit)}
          </div>
        </div>
        <button
          onClick={handleIncrease}
          className="flex-1 py-2 px-3 rounded bg-white border border-gray-200 hover:bg-gray-50 transition text-gray-700 font-semibold text-sm"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <button
        onClick={onAddToCart}
        disabled={quantity === 0}
        className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
          isAdded
            ? 'bg-emerald-700 text-white'
            : quantity === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
        }`}
        aria-label={isAdded ? 'Added to pack' : quantity === 0 ? 'Select quantity first' : 'Add to Krishna Jayanthi Pack'}
      >
        {isAdded ? (
          <>
            <Check className="w-4 h-4" />
            <span>Added to Pack</span>
          </>
        ) : quantity === 0 ? (
          <span>Select Quantity</span>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Pack</span>
          </>
        )}
      </button>
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  isAdded: boolean;
  selectedUnit: string;
  quantity: number;
  onUnitChange: (unit: string) => void;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isAdded,
  selectedUnit,
  quantity,
  onUnitChange,
  onQuantityChange,
  onAddToCart,
}) => {
  return (
    <div
      className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden flex flex-col h-full ${
        isAdded
          ? 'border-emerald-500 bg-emerald-50 shadow-lg'
          : 'border-gray-100 bg-white hover:shadow-md'
      }`}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {isAdded && (
          <div className="absolute top-3 right-3 bg-emerald-600 text-white rounded-full p-2 shadow-lg">
            <Check className="w-5 h-5" />
          </div>
        )}
        {product.low_stock && !isAdded && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
            Low Stock
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 px-3 py-3 gap-2">
        {/* Name */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 min-h-9">
          {product.name}
        </h3>

        {/* Quality Badge */}
        <div className="flex gap-1.5 text-xs">
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            ✓ Fresh
          </span>
          {product.rating && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              ⭐ {product.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Measurement Selector */}
        <MeasurementSelector product={product} selectedUnit={selectedUnit} onSelect={onUnitChange} />

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-lg font-extrabold text-gray-900">
            ₹{calculatePrice(product, quantity, selectedUnit).toFixed(0)}
          </span>
          {selectedUnit === 'kg' && (
            <span className="text-xs text-gray-500 font-medium">/{getUnitLabel(selectedUnit)}</span>
          )}
        </div>

        {/* Quantity Control */}
        <QuantityControl
          quantity={quantity}
          unit={selectedUnit}
          onQuantityChange={onQuantityChange}
          minQuantity={product.min_quantity}
          onAddToCart={onAddToCart}
          isAdded={isAdded}
        />
      </div>
    </div>
  );
};

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  onClose: () => void;
  onRemove: (productId: number) => void;
  onQuantityChange: (productId: number, quantity: number) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, cartItems, onClose, onRemove, onQuantityChange }) => {
  if (!isOpen) return null;

  const totalPrice = cartItems.reduce((sum, item) => sum + calculatePrice(item.product, item.quantity, item.selectedUnit), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl rounded-l-2xl overflow-y-auto">
        <div className="p-6 sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Krishna Jayanthi Pack</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Your pack is empty</p>
            <p className="text-sm text-gray-500 mt-1">Add Krishna Jayanthi essentials to get started</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {cartItems.map((item) => (
              <div key={item.product.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex gap-3 mb-3">
                  <img
                    src={item.product.thumbnail}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{item.product.name}</h3>
                    <p className="text-emerald-600 font-bold text-sm mt-1">
                      {item.quantityDisplay}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-900">
                    ₹{calculatePrice(item.product, item.quantity, item.selectedUnit).toFixed(0)}
                  </span>
                  <button
                    onClick={() => onRemove(item.product.id)}
                    className="text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-lg transition text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex gap-2 bg-gray-50 rounded-lg p-2">
                  <button
                    onClick={() => onQuantityChange(item.product.id, Math.max(item.product.min_quantity, item.quantity - (item.selectedUnit === 'kg' ? 0.25 : 1)))}
                    className="flex-1 py-1.5 px-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm font-medium"
                  >
                    −
                  </button>
                  <div className="flex-1 text-center text-sm font-bold">{item.quantity}</div>
                  <button
                    onClick={() => onQuantityChange(item.product.id, item.quantity + (item.selectedUnit === 'kg' ? 0.25 : 1))}
                    className="flex-1 py-1.5 px-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="border-t-2 border-gray-200 pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-2xl font-extrabold text-emerald-600">₹{totalPrice.toFixed(0)}</span>
              </div>

              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition">
                Proceed to Checkout
              </button>

              <button
                onClick={onClose}
                className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 px-4 rounded-lg transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function KrishnaJayanthiPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Product state management
  const [productState, setProductState] = useState<
    Record<number, { selectedUnit: string; quantity: number }>
  >({});

  // Initialize product state
  useEffect(() => {
    const initialState: Record<number, { selectedUnit: string; quantity: number }> = {};
    products.forEach((product) => {
      initialState[product.id] = {
        selectedUnit: product.unit === 'kg' ? 'kg' : 'pieces',
        // KG: start with 0.25, Pieces: start with 0 (customer must select)
        quantity: product.unit === 'kg' ? 0.25 : 0,
      };
    });
    setProductState(initialState);
  }, [products]);

  // Filter products by category
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((p) => p.category === selectedCategory)
      );
    }
  }, [selectedCategory, products]);

  // Fetch products from API (Currently using mock data)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // TODO: Replace with real API call
        // const response = await fetch('https://rooto.in/api/products?festival=krishna-jayanthi');
        // const data = await response.json();
        // setProducts(data);

        // For now, using mock data
        setProducts(MOCK_PRODUCTS);
        setError(null);
      } catch (err) {
        setError('Failed to load Krishna Jayanthi products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    const state = productState[product.id];
    if (!state) return;

    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + state.quantity,
                quantityDisplay: formatQuantityDisplay(
                  item.quantity + state.quantity,
                  state.selectedUnit
                ),
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product,
          selectedUnit: state.selectedUnit as any,
          quantity: state.quantity,
          quantityDisplay: formatQuantityDisplay(state.quantity, state.selectedUnit),
        },
      ]);
    }

    // Reset quantity to minimum
    setProductState({
      ...productState,
      [product.id]: {
        selectedUnit: state.selectedUnit,
        quantity: product.min_quantity || (state.selectedUnit === 'kg' ? 0.25 : 1),
      },
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const handleUpdateCartQuantity = (productId: number, newQuantity: number) => {
    setCart(
      cart.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: newQuantity,
              quantityDisplay: formatQuantityDisplay(newQuantity, item.selectedUnit),
            }
          : item
      )
    );
  };

  const isProductInCart = (productId: number) => {
    return cart.some((item) => item.product.id === productId);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + calculatePrice(item.product, item.quantity, item.selectedUnit),
    0
  );

  return (
    <div className="min-h-screen bg-white">
      <Header/>

      {/* ===== CATEGORY TABS ===== */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 border-2 ${
                selectedCategory === category.name
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:text-emerald-700'
              }`}
              aria-label={`Filter by ${category.name}`}
              aria-pressed={selectedCategory === category.name}
            >
              <span>{category.emoji}</span>
              <span>{category.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                selectedCategory === category.name
                  ? 'bg-white/30 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {filteredProducts.length}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ===== PRODUCT GRID ===== */}
      <section className="max-w-7xl mx-auto px-4 pb-32">
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-6 flex gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900">Unable to Load Products</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No Products Available</h3>
            <p className="text-gray-600 mt-2">Krishna Jayanthi products are currently unavailable in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => {
              const state = productState[product.id] || { selectedUnit: product.unit, quantity: product.min_quantity || 1 };
              const isAdded = isProductInCart(product.id);

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdded={isAdded}
                  selectedUnit={state.selectedUnit}
                  quantity={state.quantity}
                  onUnitChange={(unit) =>
                    setProductState({
                      ...productState,
                      [product.id]: {
                        ...state,
                        selectedUnit: unit,
                        // If switching to KG: use min_quantity or 0.25
                        // If switching to Pieces: reset to 0
                        quantity: unit === 'kg' ? (product.min_quantity || 0.25) : 0,
                      },
                    })
                  }
                  onQuantityChange={(quantity) =>
                    setProductState({
                      ...productState,
                      [product.id]: { ...state, quantity },
                    })
                  }
                  onAddToCart={() => handleAddToCart(product)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* ===== STICKY CART SUMMARY (MOBILE) ===== */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t-2 border-gray-200 p-4 shadow-2xl">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-between"
          >
            <div className="text-left">
              <div className="text-sm opacity-90">{cart.length} Items</div>
              <div className="text-lg font-extrabold">₹{cartTotal.toFixed(0)}</div>
            </div>
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ===== STICKY CART SUMMARY (DESKTOP) ===== */}
      {cart.length > 0 && (
        <div className="hidden md:block fixed bottom-8 right-8 bg-white rounded-2xl border-2 border-emerald-600 shadow-2xl overflow-hidden max-w-xs">
          <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
            <h3 className="font-bold">Krishna Jayanthi Pack</h3>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="text-emerald-100 hover:text-white"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">
            <div className="mb-3">
              <div className="text-sm text-gray-600">{cart.length} Items</div>
              <div className="text-2xl font-extrabold text-emerald-600">₹{cartTotal.toFixed(0)}</div>
            </div>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg transition text-sm"
            >
              View Pack
            </button>
          </div>
        </div>
      )}

      {/* ===== CART DRAWER ===== */}
      <CartDrawer
        isOpen={isDrawerOpen}
        cartItems={cart}
        onClose={() => setIsDrawerOpen(false)}
        onRemove={handleRemoveFromCart}
        onQuantityChange={handleUpdateCartQuantity}
      />
    </div>
  );
}