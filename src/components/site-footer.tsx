import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-lg font-black text-white">
              V
            </span>
            <span className="text-lg font-bold text-slate-900">Voltix</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Electronics for people who care about the details. Free shipping over
            $500, 30-day returns, 2-year warranty.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link href="/products" className="hover:text-slate-900">
                All products
              </Link>
            </li>
            <li>
              <Link
                href="/products?category=Laptops"
                className="hover:text-slate-900"
              >
                Laptops
              </Link>
            </li>
            <li>
              <Link
                href="/products?category=Audio"
                className="hover:text-slate-900"
              >
                Audio
              </Link>
            </li>
            <li>
              <Link
                href="/products?sort=price-asc"
                className="hover:text-slate-900"
              >
                Best value
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Support</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Shipping &amp; delivery</li>
            <li>Returns &amp; warranty</li>
            <li>Track an order</li>
            <li>support@voltix.example</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Store</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link href="/admin" className="hover:text-slate-900">
                Admin dashboard
              </Link>
            </li>
            <li>Mon – Sat, 9am – 7pm</li>
            <li>Ships worldwide</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Voltix Electronics. Demo store — payments are
        simulated.
      </div>
    </footer>
  );
}
