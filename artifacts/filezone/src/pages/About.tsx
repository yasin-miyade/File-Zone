import { Shield, Zap, Globe, Lock, User } from "lucide-react";
import { SEO } from "@/components/SEO";

const features = [
  { icon: Shield, title: "Privacy First", desc: "Your files never leave your browser. All processing happens locally on your device — nothing is uploaded to our servers." },
  { icon: Zap, title: "Lightning Fast", desc: "Powered by WebAssembly and modern browser APIs, FileZone processes files in seconds without any waiting or queues." },
  { icon: Globe, title: "Works Everywhere", desc: "No installation needed. FileZone runs in any modern browser on any device — desktop, tablet, or mobile." },
  { icon: Lock, title: "Completely Free", desc: "All tools are free to use with no sign-up, no limits, and no watermarks on your output files." },
];

export function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <SEO
        title="About FileZone"
        description="FileZone is a free, privacy-first browser-based file toolkit created by Yasin Miyade. No uploads, no sign-up — all processing happens locally in your browser."
        keywords="about filezone, yasin miyade, file tools, privacy first"
      />
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">About FileZone</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          FileZone is a free online toolkit for everyday file tasks. Merge PDFs, compress images, convert files, generate QR codes — all without installing anything or uploading files to a server.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="p-6 rounded-2xl border bg-card">
            <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-primary/5 border border-primary/20 p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-primary/10 w-fit">
            <User className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Meet the Creator</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-3">
          FileZone was created and is maintained by <strong className="text-foreground">Yasin Miyade</strong>. This project was built with a passion for creating useful, privacy-respecting tools that anyone can use for free.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          All file processing happens entirely in your browser — your data stays on your device, always. FileZone is a completely independent website with no corporate backing or data collection.
        </p>
      </div>

      <div className="rounded-2xl bg-muted/50 border p-8">
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>FileZone is built with your privacy in mind. All file processing operations occur entirely within your browser using JavaScript and WebAssembly. Your files are never transmitted to any server.</p>
          <p>We collect only anonymous, aggregate usage statistics (tool popularity counts) to understand which tools are most useful. No personal information, file contents, or file metadata is ever collected or stored.</p>
          <p>FileZone does not require sign-up, does not track you across sessions, and does not share any data with third parties. The service will always remain free.</p>
        </div>
      </div>
    </div>
  );
}
