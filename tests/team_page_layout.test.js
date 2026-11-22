import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const readSrc = (relPath) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Halaman Tim Kami — Konsistensi Background & Layout dengan Halaman Lain", () => {
  it("PublicLayout.jsx tidak lagi memakai background hitam khusus /team", () => {
    const content = readSrc("src/layouts/PublicLayout.jsx");
    expect(content).toContain("bg-[#FFF5CF]");
    expect(content).toContain("text-[#141414]");
    expect(content).not.toContain("isTeamPage");
    expect(content).not.toContain("bg-[#000000]");
  });

  it("Navbar.jsx tidak lagi mengubah header menjadi hitam khusus halaman /team", () => {
    const content = readSrc("src/components/public/Navbar.jsx");
    expect(content).not.toContain("isTeamPage");
    expect(content).not.toContain("bg-[#000000]");
  });

  it("Team.jsx menggunakan background cream #FFF5CF, container standar, foto portrait full aspect-[4/5], tanpa header Tim & Barista dan tanpa tombol filter per jabatan", () => {
    const content = readSrc("src/pages/public/Team.jsx");
    expect(content).toContain("Semua Tim");
    expect(content).toContain("aspect-[4/5]");
    expect(content).not.toContain("Tim & Barista");
    expect(content).not.toContain("roleFilters");
    expect(content).not.toContain("activeRole");
    expect(content).toContain("bg-[#FFF5CF]");
    expect(content).toContain("text-[#141414]");
    expect(content).toContain("max-w-7xl 2xl:max-w-[1600px]");
    expect(content).not.toContain("bg-[#000000]");
    expect(content).not.toContain("skewX");
  });

  it("TeamManagement.jsx preview kartu selaras dengan desain cream editorial (tanpa kartu hitam miring)", () => {
    const content = readSrc("src/pages/admin/TeamManagement.jsx");
    expect(content).toContain("bg-[#FFF5CF]");
    expect(content).not.toContain("skewX");
  });
});
