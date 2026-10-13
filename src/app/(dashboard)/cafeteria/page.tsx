"use client";

import { ModalForm } from "@/components/shared/ModalForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/components/shared/Toast";
import { Badge } from "@/components/ui/badge";
import { CafeteriaOrder, MenuItem, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  Coffee,
  Minus,
  Plus,
  QrCode,
  Receipt,
  ShoppingBag,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useMemo, useState } from "react";

export default function CafeteriaPage() {
  const store = useAppStore();
  const { toast } = useToast();
  const { data: session } = useSession();

  const userRole = (session?.user?.role as string) || "STUDENT";
  const userName = session?.user?.name || "Ananya Reddy";
  const isStaff = userRole === "CAFETERIA_STAFF" || userRole === "ADMIN";

  const [activeTab, setActiveTab] = useState<"menu" | "orders" | "kitchen">("menu");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Cart State: { [itemId: string]: number }
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [pickupSlot, setPickupSlot] = useState("12:45 PM");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Cart Calculations
  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = store.menu.find((m) => m.id === id)!;
        return { ...item, quantity: qty };
      });
  }, [cart, store.menu]);

  const totalAmount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const addToCart = (itemId: string) => {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const current = prev[itemId] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: current - 1 };
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    setIsPlacingOrder(true);
    setTimeout(() => {
      const itemsPayload = cartItems.map((c) => ({
        name: c.name,
        quantity: c.quantity,
        price: c.price,
      }));

      const tokenNumber = store.placeOrder(userName, itemsPayload, pickupSlot);
      setCart({});
      setIsPlacingOrder(false);
      setActiveTab("orders");

      toast({
        title: "Order Dispatched to Canteen!",
        description: `Food Token #${tokenNumber} generated. Pick up at ${pickupSlot}.`,
        variant: "success",
      });
    }, 700);
  };

  const handleUpdateOrderStatus = (orderId: string, status: "Preparing" | "Ready" | "Completed") => {
    store.updateOrderStatus(orderId, status);
    toast({
      title: `Order Updated: ${status}`,
      description: `Token marked as ${status.toUpperCase()} on kitchen screens.`,
      variant: status === "Ready" ? "success" : "info",
    });
  };

  const filteredMenu = selectedCategory === "All"
    ? store.menu
    : store.menu.filter((m) => m.category === selectedCategory);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Coffee className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Cafeteria Express Pre-Order
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Skip long counter queues. Pre-order fresh food, get digital pickup tokens, and collect on time.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab("menu")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "menu"
                ? "bg-orange-500 text-slate-950 shadow-md font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <UtensilsCrossed className="w-4 h-4" /> Live Menu
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "orders"
                ? "bg-orange-500 text-slate-950 shadow-md font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <Receipt className="w-4 h-4" /> My Orders ({store.orders.length})
          </button>
          <button
            onClick={() => setActiveTab("kitchen")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "kitchen"
                ? "bg-orange-500 text-slate-950 shadow-md font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <ChefHat className="w-4 h-4" /> Kitchen Staff Screen
          </button>
        </div>
      </div>

      {/* TAB 1: MENU & ORDER TRAY */}
      {activeTab === "menu" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Menu Catalog */}
          <div className="lg:col-span-8 space-y-5">
            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {["All", "Breakfast", "Meals", "Beverages", "Snacks"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                    selectedCategory === cat
                      ? "bg-orange-500 text-slate-950 font-bold shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMenu.map((item) => {
                const inCart = cart[item.id] || 0;

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/40 shadow-sm transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                          {item.imageEmoji}
                        </span>
                        <div>
                          <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 text-[10px]">
                            {item.category}
                          </Badge>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-orange-500" /> Prep: {item.prepTime}
                          </span>
                        </div>
                      </div>

                      <span className="font-mono font-black text-base text-slate-900 dark:text-slate-100">
                        ₹{item.price}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Kitchen Ready
                      </span>

                      {inCart === 0 ? (
                        <button
                          onClick={() => addToCart(item.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono font-bold text-xs px-1">{inCart}</span>
                          <button
                            onClick={() => addToCart(item.id)}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Cart & Checkout Tray */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 h-fit sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Pre-Order Tray
                </h3>
              </div>
              <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-mono">
                {cartItems.length} Item(s)
              </Badge>
            </div>

            {cartItems.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <UtensilsCrossed className="w-8 h-8 mx-auto text-slate-500 opacity-50" />
                <p>Your order tray is empty.</p>
                <p className="text-[11px] text-slate-500">Add dishes to pick up at counter without waiting.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {cartItems.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/80"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          {c.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {c.quantity} × ₹{c.price}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        ₹{c.quantity * c.price}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pickup Slot Selection */}
                <div className="space-y-1.5 pt-2 border-t text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Counter Pickup Time Slot:
                  </label>
                  <select
                    value={pickupSlot}
                    onChange={(e) => setPickupSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option>12:45 PM (In 15 mins)</option>
                    <option>01:00 PM (In 30 mins)</option>
                    <option>01:15 PM</option>
                    <option>01:30 PM (Lunch Break)</option>
                    <option>04:30 PM (Evening Snacks)</option>
                  </select>
                </div>

                {/* Bill Breakdown */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Items Subtotal</span>
                    <span className="font-mono">₹{totalAmount}.00</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Express Counter Token Fee</span>
                    <span className="font-mono text-emerald-500">FREE</span>
                  </div>
                  <div className="flex justify-between text-slate-900 dark:text-slate-100 font-bold text-sm pt-1 border-t">
                    <span>Total Amount</span>
                    <span className="font-mono text-orange-500">₹{totalAmount}.00</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isPlacingOrder}
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {isPlacingOrder ? "Placing Order..." : `Confirm & Pay ₹${totalAmount}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY ORDERS & TOKENS */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {store.orders.map((ord) => {
              const isReady = ord.status === "Ready";
              const isCompleted = ord.status === "Completed";

              return (
                <div
                  key={ord.orderId}
                  className={cn(
                    "p-6 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm space-y-4",
                    isReady
                      ? "border-emerald-500 shadow-emerald-500/10"
                      : "border-slate-200 dark:border-slate-800"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-mono font-black text-orange-500">
                          {ord.tokenNumber}
                        </span>
                        <span className="text-xs text-slate-400">• {ord.createdAt}</span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Pickup Slot: <strong className="text-slate-900 dark:text-slate-100">{ord.pickupSlot}</strong>
                      </span>
                    </div>

                    <StatusBadge
                      status={
                        ord.status === "Ready"
                          ? "Approved"
                          : ord.status === "Completed"
                          ? "Resolved"
                          : "In progress"
                      }
                      label={ord.status.toUpperCase()}
                    />
                  </div>

                  {/* Items Summary */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border text-xs space-y-1.5">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {it.quantity} × {it.name}
                        </span>
                        <span className="font-mono text-slate-600 dark:text-slate-400">
                          ₹{it.price * it.quantity}
                        </span>
                      </div>
                    ))}
                    <div className="pt-1.5 border-t flex justify-between font-bold text-slate-900 dark:text-slate-100">
                      <span>Total Paid</span>
                      <span className="font-mono text-orange-500">₹{ord.totalAmount}</span>
                    </div>
                  </div>

                  {/* Token instructions */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Show token at Canteen Counter 2</span>
                    {isReady && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> FOOD READY FOR PICKUP
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: KITCHEN STAFF SCREEN */}
      {activeTab === "kitchen" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Kitchen Display System (KDS)
              </h3>
              <p className="text-xs text-slate-500">
                Staff portal to update live food prep stages and notify students.
              </p>
            </div>
            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-bold">
              Chef Station Online
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {store.orders.map((ord) => (
              <div
                key={ord.orderId}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-black text-orange-500">
                      {ord.tokenNumber}
                    </span>
                    <Badge className="text-[10px] font-bold uppercase">{ord.status}</Badge>
                  </div>

                  <div className="text-xs text-slate-500">
                    <p>Student: <strong>{ord.studentName}</strong></p>
                    <p>Target Slot: <strong>{ord.pickupSlot}</strong></p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs space-y-1">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="font-semibold text-slate-900 dark:text-slate-100">
                        • {it.quantity} × {it.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t flex flex-col gap-2">
                  {ord.status === "Placed" && (
                    <button
                      onClick={() => handleUpdateOrderStatus(ord.orderId, "Preparing")}
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                    >
                      Mark "Preparing"
                    </button>
                  )}
                  {ord.status === "Preparing" && (
                    <button
                      onClick={() => handleUpdateOrderStatus(ord.orderId, "Ready")}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Mark "Ready for Pickup"
                    </button>
                  )}
                  {ord.status === "Ready" && (
                    <button
                      onClick={() => handleUpdateOrderStatus(ord.orderId, "Completed")}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                    >
                      Mark "Completed"
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
