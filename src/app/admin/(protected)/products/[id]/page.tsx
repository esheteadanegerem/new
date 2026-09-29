import { notFound } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { getProductById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const product = getProductById(Number(id));
  if (!product) notFound();

  return (
    <div>
      <h2 className="text-lg font-semibold">Edit {product.name}</h2>
      <p className="text-sm text-slate-500">
        Changes go live on the storefront as soon as you save.
      </p>
      <ProductForm product={product} />
    </div>
  );
}
