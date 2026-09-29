import { ProductForm } from "@/components/product-form";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold">New product</h2>
      <p className="text-sm text-slate-500">
        Add an item to the catalog. It appears in the storefront immediately.
      </p>
      <ProductForm />
    </div>
  );
}
