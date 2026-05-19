import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs text-warm-gray hover:text-charcoal mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All products
        </Link>
        <h1 className="font-heading text-3xl text-charcoal mb-1">
          New product
        </h1>
        <p className="text-sm text-warm-gray">
          Pick a slug (the URL), fill in the basics, and save. Variants and
          images come after — manage those in Supabase Studio for now.
        </p>
      </div>

      <ProductForm mode="new" />
    </div>
  );
}
