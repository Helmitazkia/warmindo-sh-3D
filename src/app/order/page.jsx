"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { categories as defaultCategories, menus as defaultMenus, tables as defaultTables } from "@/data/menuData";
import OrderHeader from "@/components/order/OrderHeader";
import OrderItemCard from "@/components/order/OrderItemCard";
import CartFloatingBar from "@/components/order/CartFloatingBar";
import CheckoutDrawer from "@/components/order/CheckoutDrawer";
import OrderSuccessView from "@/components/order/OrderSuccessView";
import MenuCustomizationModal from "@/components/order/MenuCustomizationModal";

function OrderPageContent() {
  const searchParams = useSearchParams();
  const initialTable = searchParams.get("table") || "01";

  const [tableNumber, setTableNumber] = useState(initialTable);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState({}); // { [itemId]: quantity }
  const [itemNotes, setItemNotes] = useState({}); // { [itemId]: noteString }
  const [selectedToppings, setSelectedToppings] = useState({}); // { [itemId]: [ { id, name, price } ] }
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [customizingMenu, setCustomizingMenu] = useState(null);

  // Dynamic Data from MySQL
  const [categories, setCategories] = useState(defaultCategories);
  const [menuList, setMenuList] = useState(defaultMenus);
  const [tableList, setTableList] = useState(defaultTables);
  const [toppingsList, setToppingsList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch Menus & Tables from Database on Mount
  useEffect(() => {
    async function loadData() {
      try {
        const [menuRes, tableRes, toppingRes] = await Promise.all([
          fetch("/api/menus"),
          fetch("/api/tables"),
          fetch("/api/toppings"),
        ]);

        const menuJson = await menuRes.json();
        const tableJson = await tableRes.json();
        const toppingJson = await toppingRes.json();

        if (menuJson.success && menuJson.data) {
          if (menuJson.data.categories?.length > 0) {
            setCategories(menuJson.data.categories);
          }
          if (menuJson.data.menus?.length > 0) {
            setMenuList(menuJson.data.menus);
          }
        }

        if (tableJson.success && tableJson.data?.length > 0) {
          setTableList(tableJson.data);
        }

        if (toppingJson.success && toppingJson.data?.length > 0) {
          setToppingsList(toppingJson.data);
        }
      } catch (err) {
        console.warn("Using fallback local dataset:", err);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, []);

  // Filtered Menu List
  const filteredMenus = useMemo(() => {
    return menuList.filter((item) => {
      const matchCategory =
        selectedCategory === "all" ||
        item.categoryId === selectedCategory ||
        item.categorySlug === selectedCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [menuList, selectedCategory, searchQuery]);

  // Cart Calculations (includes toppings)
  const cartItems = useMemo(() => {
    return Object.keys(cart)
      .filter((id) => cart[id] > 0)
      .map((id) => {
        const item = menuList.find((m) => String(m.id) === String(id)) || defaultMenus.find((m) => String(m.id) === String(id));
        const allowedToppingIds = Array.isArray(item?.allowToppingIds)
          ? item.allowToppingIds
          : item?.allow_toppings
          ? String(item.allow_toppings).split(",").map(Number).filter(Boolean)
          : [];
        const allowsTopping = allowedToppingIds.length > 0;
        const chosenToppings = allowsTopping ? (selectedToppings[id] || []) : [];
        const toppingTotal = chosenToppings.reduce((sum, t) => sum + Number(t.price || 0), 0);
        const finalUnitPrice = Number(item?.price || 0) + toppingTotal;
        return {
          ...item,
          basePrice: Number(item?.price || 0),
          price: finalUnitPrice,
          toppings: chosenToppings,
          quantity: cart[id],
        };
      });
  }, [cart, menuList, selectedToppings]);

  const totalCartCount = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const totalCartPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  // Current table capacity
  const currentTableData = useMemo(() => {
    return (
      tableList.find(
        (t) =>
          String(t.tableNumber) === String(tableNumber) ||
          String(t.id) === String(tableNumber) ||
          t.name === `Meja ${tableNumber}`
      ) || { capacity: 4, name: `Meja ${tableNumber}` }
    );
  }, [tableList, tableNumber]);

  // Handlers
  const handleOpenCustomization = (item) => {
    setCustomizingMenu(item);
  };

  const handleConfirmCustomization = ({ menu, quantity, toppings, note }) => {
    setCart((prev) => ({
      ...prev,
      [menu.id]: quantity,
    }));
    setSelectedToppings((prev) => ({
      ...prev,
      [menu.id]: toppings,
    }));
    if (note !== undefined) {
      setItemNotes((prev) => ({
        ...prev,
        [menu.id]: note,
      }));
    }
  };

  const handleAddToCart = (item) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  const handleRemoveFromCart = (item) => {
    setCart((prev) => {
      const nextQty = (prev[item.id] || 0) - 1;
      if (nextQty <= 0) {
        const updated = { ...prev };
        delete updated[item.id];
        return updated;
      }
      return {
        ...prev,
        [item.id]: nextQty,
      };
    });
  };

  const handleUpdateNote = (itemId, note) => {
    setItemNotes((prev) => ({
      ...prev,
      [itemId]: note,
    }));
  };

  const handleToggleTopping = (itemId, topping) => {
    setSelectedToppings((prev) => {
      const current = prev[itemId] || [];
      const exists = current.some((t) => t.id === topping.id);
      const updated = exists
        ? current.filter((t) => t.id !== topping.id)
        : [...current, { id: topping.id, name: topping.name, price: Number(topping.price) || 0 }];
      return {
        ...prev,
        [itemId]: updated,
      };
    });
  };

  const handleSubmitOrder = (savedOrderData) => {
    setCompletedOrder(savedOrderData);
    setIsCheckoutOpen(false);
    setCart({});
    setItemNotes({});
    setSelectedToppings({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetOrder = () => {
    setCompletedOrder(null);
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        paddingBottom: totalCartCount > 0 ? 110 : 40,
        position: "relative",
      }}
    >
      {/* If Order is already completed, show Invoice Screen */}
      {completedOrder ? (
        <div style={{ padding: "20px 16px" }}>
          <OrderSuccessView
            order={completedOrder}
            onResetOrder={handleResetOrder}
          />
        </div>
      ) : (
        <>
          {/* Header & Clean Underlined Category Bar */}
          <OrderHeader
            tableNumber={tableNumber}
            setTableNumber={setTableNumber}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            tables={tableList}
          />

          {/* Main Content Area */}
          <main style={{ maxWidth: 640, margin: "0 auto", padding: "16px" }}>
            {/* Table Indicator Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(251,191,36,0.08))",
                border: "1px solid rgba(249,115,22,0.25)",
                borderRadius: 16,
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.4rem" }}>🍜</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fbbf24" }}>
                    Dine-In di Meja {tableNumber} (Sisa {currentTableData.formattedRemaining !== undefined ? currentTableData.formattedRemaining : currentTableData.remaining} dari Maks {currentTableData.capacity} Orang)
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {currentTableData.occupied > 0
                      ? `Sedang ada ${currentTableData.occupied} orang yang memesan di meja ini`
                      : "Pesananmu langsung terhubung ke database & kasir"}
                  </div>
                </div>
              </div>
              {/* <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#34d399",
                  background: "rgba(52,211,153,0.15)",
                  padding: "4px 8px",
                  borderRadius: 6,
                }}
              >
                ● DB Aktif
              </span> */}
            </div>

            {/* Menu List */}
            {filteredMenus.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 16px",
                  color: "var(--text-muted)",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔍</div>
                <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>
                  Menu Tidak Ditemukan
                </div>
                <div style={{ fontSize: "0.82rem" }}>
                  Coba kata kunci lain atau pilih tab kategori yang berbeda.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filteredMenus.map((item) => (
                  <OrderItemCard
                    key={item.id}
                    item={item}
                    cartQty={cart[item.id] || 0}
                    onAddToCart={handleAddToCart}
                    onRemoveFromCart={handleRemoveFromCart}
                    itemNote={itemNotes[item.id]}
                    onUpdateNote={handleUpdateNote}
                    availableToppings={toppingsList}
                    selectedToppings={selectedToppings[item.id] || []}
                    onToggleTopping={handleToggleTopping}
                    onOpenCustomization={handleOpenCustomization}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Sticky Floating Cart */}
          <CartFloatingBar
            totalItems={totalCartCount}
            totalPrice={totalCartPrice}
            onOpenCart={() => setIsCheckoutOpen(true)}
          />

          {/* Modal Kustomisasi Menu & Topping Ala ShopeeFood */}
          <MenuCustomizationModal
            isOpen={!!customizingMenu}
            onClose={() => setCustomizingMenu(null)}
            menu={customizingMenu}
            availableToppings={toppingsList}
            initialSelectedToppings={customizingMenu ? selectedToppings[customizingMenu.id] || [] : []}
            initialNote={customizingMenu ? itemNotes[customizingMenu.id] || "" : ""}
            initialQty={customizingMenu ? cart[customizingMenu.id] || 1 : 1}
            onConfirm={handleConfirmCustomization}
          />

          {/* Checkout Bottom Sheet */}
          <CheckoutDrawer
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            itemNotes={itemNotes}
            tableNumber={tableNumber}
            tables={tableList}
            onSubmitOrder={handleSubmitOrder}
          />
        </>
      )}
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
          }}
        >
          Memuat menu Warmindo SH... 🍜
        </div>
      }
    >
      <OrderPageContent />
    </Suspense>
  );
}
