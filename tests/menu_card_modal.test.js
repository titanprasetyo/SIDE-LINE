import { describe, it, expect } from "vitest";
import { parseMenuPromoData, getPromoBadgeLabel } from "../src/services/menuService";
import { cleanText, toWhatsAppLink } from "../src/utils/text";

describe("Menu Card & Detail Modal Logic", () => {
  it("harus memformat promo diskon nominal dengan benar untuk badge dan harga", () => {
    const rawMenu = {
      id: "menu-1",
      name: "Cafe Latte",
      price: 32000,
      is_promo: true,
      discount_type: "nominal",
      discount_amount: 4000,
      promo_label_type: "hemat_lebih",
    };

    const parsed = parseMenuPromoData(rawMenu);
    expect(parsed.discounted_price).toBe(28000);
    expect(parsed.discount_amount).toBe(4000);
    expect(getPromoBadgeLabel(parsed)).toBe("LEBIH HEMAT Rp 4.000");
  });

  it("harus memformat promo diskon persentase dengan benar", () => {
    const rawMenu = {
      id: "menu-2",
      name: "Coffe cream",
      price: 34000,
      is_promo: true,
      discount_type: "percent",
      discount_percent: 10,
      promo_label_type: "percent",
    };

    const parsed = parseMenuPromoData(rawMenu);
    expect(parsed.discounted_price).toBe(30600);
    expect(getPromoBadgeLabel(parsed)).toBe("PROMO -10%");
  });

  it("harus menghasilkan link WhatsApp order yang benar untuk modal pemesanan", () => {
    const phone = "6281234567890";
    const itemName = cleanText("Cafe Latte");
    const text = `Halo Side Line, saya ingin memesan menu: *${itemName}*. Mohon info ketersediaan dan cara pembayarannya.`;
    const waLink = toWhatsAppLink(phone, text);

    expect(waLink).toContain("https://wa.me/6281234567890?text=");
    expect(waLink).toContain("Cafe%20Latte");
  });

  it("harus menangani menu tanpa promo dengan harga normal", () => {
    const rawMenu = {
      id: "menu-3",
      name: "Americano",
      price: 22000,
      is_promo: false,
    };

    const parsed = parseMenuPromoData(rawMenu);
    expect(parsed.discounted_price).toBe(22000);
    expect(parsed.is_promo).toBe(false);
  });
});
