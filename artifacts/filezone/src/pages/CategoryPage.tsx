import { useListTools } from "@workspace/api-client-react";
import { ToolCard } from "@/components/ToolCard";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Image, RefreshCw, AlignLeft, Calculator } from "lucide-react";
import { AdBanner } from "@/components/AdBanner";
import { SEO } from "@/components/SEO";

const categoryMeta: Record<string, {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = {
  pdf: { title: "PDF Tools", description: "All the tools you need to work with PDF files — merge, split, compress, convert and more.", icon: FileText, color: "text-red-500" },
  image: { title: "Image Tools", description: "Compress, resize, crop, convert and edit images directly in your browser.", icon: Image, color: "text-blue-500" },
  convert: { title: "Convert Tools", description: "Convert files and data between popular formats in seconds.", icon: RefreshCw, color: "text-violet-500" },
  text: { title: "Text Tools", description: "Analyze, format and transform text with our free online tools.", icon: AlignLeft, color: "text-emerald-500" },
  calculator: { title: "Calculators", description: "Free online calculators for math, finance, health, education and everyday use.", icon: Calculator, color: "text-amber-500" },
};

export function CategoryPage({ category }: { category: string }) {
  const { data: tools, isLoading } = useListTools();
  const meta = categoryMeta[category];
  const filtered = (tools ?? []).filter(t => t.category === category);

  if (!meta) return <div className="p-8 text-center text-muted-foreground">Category not found.</div>;

  const Icon = meta.icon;

  const keywords: Record<string, string> = {
    pdf: "pdf tools, merge pdf, compress pdf, pdf to jpg, online pdf editor",
    image: "image tools, compress image, resize image, convert image, image editor online",
    convert: "file converter, csv to json, markdown to html, url encoder, color converter",
    text: "text tools, word counter, qr code generator, base64 encoder, json formatter",
    calculator: "online calculator, bmi calculator, age calculator, percentage calculator, loan calculator",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <SEO
        title={meta.title}
        description={`${meta.description} Free, fast, and private — all processing in your browser.`}
        keywords={keywords[category]}
      />
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 rounded-xl bg-muted">
          <Icon className={`h-7 w-7 ${meta.color}`} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{meta.title}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{meta.description}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-8">
        {isLoading ? "Loading…" : `${filtered.length} tools available`}
      </p>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No tools found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(t => (
            <ToolCard key={t.slug} {...t} usageCount={t.usageCount ?? 0} isFeatured={t.isFeatured ?? false} />
          ))}
        </div>
      )}

      {/* AdSense — leaderboard below tool grid */}
      <div className="mt-12">
        <AdBanner slot="leaderboard" />
      </div>
    </div>
  );
}
