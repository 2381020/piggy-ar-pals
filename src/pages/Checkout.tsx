import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { id: 1, name: "Babi Panggang Karo", price: 85000, emoji: "🍖", desc: "Daging babi panggang bumbu khas Karo" },
  { id: 2, name: "Saksang", price: 45000, emoji: "🥘", desc: "Masakan tradisional Batak dengan santan" },
  { id: 3, name: "Babi Panggang Sambal", price: 75000, emoji: "🌶️", desc: "Babi panggang dengan sambal pedas" },
  { id: 4, name: "Sei Babi", price: 65000, emoji: "🥩", desc: "Daging babi asap khas NTT" },
  { id: 5, name: "Nasi Campur Bali", price: 55000, emoji: "🍚", desc: "Nasi campur dengan lawar & sate lilit" },
];

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Record<number, number>>({});
  const [orderPlaced, setOrderPlaced] = useState(false);

  const addItem = (id: number) => setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeItem = (id: number) =>
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[id] > 1) newCart[id]--;
      else delete newCart[id];
      return newCart;
    });

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => m.id === Number(id));
    return sum + (item?.price || 0) * qty;
  }, 0);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="text-7xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Pesanan Berhasil!</h2>
        <p className="text-muted-foreground mb-6">Pesanan kamu sedang diproses</p>
        <Button onClick={() => navigate("/")} className="rounded-2xl px-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke AR
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-foreground">PigAR Kitchen</h1>
          <p className="text-xs text-muted-foreground">Delivery • 25-35 min</p>
        </div>
        <Badge className="ml-auto rounded-full">⭐ 4.8</Badge>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-3 pb-32">
        {menuItems.map((item) => (
          <Card key={item.id} className="overflow-hidden border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <span className="text-4xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.desc}</p>
                <p className="text-sm font-bold text-primary mt-1">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                {cart[item.id] ? (
                  <>
                    <Button variant="outline" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8 rounded-full">
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-5 text-center text-sm font-bold text-foreground">{cart[item.id]}</span>
                  </>
                ) : null}
                <Button size="icon" onClick={() => addItem(item.id)} className="h-8 w-8 rounded-full">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom checkout bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border p-4">
          <Button
            className="w-full h-12 rounded-2xl text-base font-bold"
            onClick={() => setOrderPlaced(true)}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Pesan ({totalItems} item) — {formatPrice(totalPrice)}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Checkout;
