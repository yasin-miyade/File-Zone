import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Layers, LogOut, Eye, EyeOff, Star, StarOff, Pencil, Trash2,
  Save, X, ArrowLeft, Settings, BarChart2, RefreshCw, Users,
  FileStack, Plus, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const API = "/api";

interface Tool {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  route: string;
  usageCount: number;
  isFeatured: boolean;
  isHidden: boolean;
  sortOrder: number;
  inputFormats: string[];
  outputFormats: string[];
}

interface SiteSettings {
  site_title?: string;
  site_description?: string;
  site_keywords?: string;
  admin_password?: string;
  analytics_code?: string;
}

interface AdminStats {
  totalFilesProcessed: number;
  totalTools: number;
  hiddenTools: number;
  featuredTools: number;
  totalVisitors: number;
  topTools: { slug: string; name: string; category: string; usageCount: number }[];
  conversionsByCategory: { category: string; count: number }[];
}

const categoryColors: Record<string, string> = {
  pdf: "bg-red-100 text-red-700",
  image: "bg-blue-100 text-blue-700",
  convert: "bg-violet-100 text-violet-700",
  text: "bg-emerald-100 text-emerald-700",
  calculator: "bg-amber-100 text-amber-700",
};

// ----- Login Screen -----
function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) { setError("Wrong password"); return; }
      const data = await res.json();
      onLogin(data.token);
    } catch {
      setError("Connection error");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm bg-card border rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-primary p-1.5 rounded-lg"><Layers className="h-5 w-5 text-primary-foreground" /></div>
          <span className="font-bold text-lg">FileZone Admin</span>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Admin Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" autoFocus />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">Default password: admin123</p>
      </div>
    </div>
  );
}

// ----- Edit Tool Modal -----
function EditToolModal({ tool, token, onSave, onClose }: {
  tool: Tool; token: string;
  onSave: (updated: Tool) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: tool.name,
    description: tool.description,
    category: tool.category,
    icon: tool.icon,
    inputFormats: tool.inputFormats.join(", "),
    outputFormats: tool.outputFormats.join(", "),
    isFeatured: tool.isFeatured,
    isHidden: tool.isHidden,
    sortOrder: String(tool.sortOrder),
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/tools/${tool.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          category: form.category,
          icon: form.icon,
          isFeatured: form.isFeatured,
          isHidden: form.isHidden,
          sortOrder: parseInt(form.sortOrder) || 0,
          inputFormats: form.inputFormats.split(",").map(s => s.trim()).filter(Boolean),
          outputFormats: form.outputFormats.split(",").map(s => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      onSave(updated);
      toast({ title: "Tool updated" });
    } catch {
      toast({ title: "Failed to update tool", variant: "destructive" });
    } finally { setSaving(false); }
  }

  function set(k: keyof typeof form, v: string | boolean) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-lg">Edit: {tool.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={e => set("name", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={e => set("description", e.target.value)} className="resize-none h-20" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Category</Label><Input value={form.category} onChange={e => set("category", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Icon (Lucide name)</Label><Input value={form.icon} onChange={e => set("icon", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Input Formats (comma sep)</Label><Input value={form.inputFormats} onChange={e => set("inputFormats", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Output Formats (comma sep)</Label><Input value={form.outputFormats} onChange={e => set("outputFormats", e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => set("sortOrder", e.target.value)} /></div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch id="featured" checked={form.isFeatured} onCheckedChange={v => set("isFeatured", v)} />
              <Label htmlFor="featured">Featured</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="hidden" checked={form.isHidden} onCheckedChange={v => set("isHidden", v)} />
              <Label htmlFor="hidden">Hidden</Label>
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            <Save className="h-4 w-4 mr-2" />{saving ? "Saving…" : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ----- Add Tool Modal -----
function AddToolModal({ token, onAdd, onClose }: {
  token: string;
  onAdd: (tool: Tool) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    slug: "", name: "", description: "", category: "pdf",
    icon: "FileText", inputFormats: "", outputFormats: "",
    isFeatured: false, isHidden: false, sortOrder: "0",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function handleAdd() {
    if (!form.slug || !form.name || !form.description) {
      toast({ title: "slug, name and description are required", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/tools`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          sortOrder: parseInt(form.sortOrder) || 0,
          inputFormats: form.inputFormats.split(",").map(s => s.trim()).filter(Boolean),
          outputFormats: form.outputFormats.split(",").map(s => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      onAdd(created);
      toast({ title: "Tool created" });
    } catch {
      toast({ title: "Failed to create tool", variant: "destructive" });
    } finally { setSaving(false); }
  }

  function set(k: keyof typeof form, v: string | boolean) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-lg">Add New Tool</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Slug <span className="text-destructive">*</span></Label><Input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="e.g. pdf-compress" /></div>
            <div className="space-y-1.5"><Label>Name <span className="text-destructive">*</span></Label><Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Compress PDF" /></div>
          </div>
          <div className="space-y-1.5"><Label>Description <span className="text-destructive">*</span></Label><Textarea value={form.description} onChange={e => set("description", e.target.value)} className="resize-none h-20" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.category} onChange={e => set("category", e.target.value)}>
                {["pdf", "image", "convert", "text", "calculator"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5"><Label>Icon (Lucide name)</Label><Input value={form.icon} onChange={e => set("icon", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Input Formats (comma sep)</Label><Input value={form.inputFormats} onChange={e => set("inputFormats", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Output Formats (comma sep)</Label><Input value={form.outputFormats} onChange={e => set("outputFormats", e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => set("sortOrder", e.target.value)} /></div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2"><Switch checked={form.isFeatured} onCheckedChange={v => set("isFeatured", v)} /><Label>Featured</Label></div>
            <div className="flex items-center gap-2"><Switch checked={form.isHidden} onCheckedChange={v => set("isHidden", v)} /><Label>Hidden</Label></div>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t">
          <Button onClick={handleAdd} disabled={saving} className="flex-1"><Plus className="h-4 w-4 mr-2" />{saving ? "Creating…" : "Create Tool"}</Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ----- Settings Panel -----
function SettingsPanel({ token, onPasswordChange }: { token: string; onPasswordChange: (pw: string) => void }) {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`${API}/admin/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setSettings(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Settings saved" });
      if (settings.admin_password) onPasswordChange(settings.admin_password);
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    } finally { setSaving(false); }
  }

  function set(k: keyof SiteSettings, v: string) {
    setSettings(prev => ({ ...prev, [k]: v }));
  }

  if (loading) return <p className="text-muted-foreground text-sm">Loading settings…</p>;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="space-y-1.5">
        <Label>Site Title</Label>
        <Input value={settings.site_title ?? ""} onChange={e => set("site_title", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Meta Description</Label>
        <Textarea value={settings.site_description ?? ""} onChange={e => set("site_description", e.target.value)} className="resize-none h-24" />
      </div>
      <div className="space-y-1.5">
        <Label>Meta Keywords</Label>
        <Input value={settings.site_keywords ?? ""} onChange={e => set("site_keywords", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Analytics / Header Code (HTML)</Label>
        <Textarea value={settings.analytics_code ?? ""} onChange={e => set("analytics_code", e.target.value)} placeholder="<!-- Google Analytics or other scripts -->" className="font-mono text-xs resize-none h-24" />
      </div>
      <Separator />
      <div className="space-y-1.5">
        <Label>Change Admin Password</Label>
        <Input type="password" value={settings.admin_password ?? ""} onChange={e => set("admin_password", e.target.value)} placeholder="New password" />
        <p className="text-xs text-muted-foreground">Leave blank to keep current password. You'll be logged out after changing.</p>
      </div>
      <Button onClick={handleSave} disabled={saving}>
        <Save className="h-4 w-4 mr-2" />{saving ? "Saving…" : "Save Settings"}
      </Button>
    </div>
  );
}

// ----- Main Admin Page -----
export function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem("admin_token") ?? "");
  const [tools, setTools] = useState<Tool[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [addingTool, setAddingTool] = useState(false);
  const [activeTab, setActiveTab] = useState<"tools" | "stats" | "settings">("tools");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  function handleLogin(t: string) {
    sessionStorage.setItem("admin_token", t);
    setToken(t);
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_token");
    setToken("");
  }

  async function loadTools() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/tools`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { handleLogout(); return; }
      const data = await res.json();
      setTools(data);
    } catch {
      toast({ title: "Failed to load tools", variant: "destructive" });
    } finally { setLoading(false); }
  }

  async function loadStats() {
    try {
      const res = await fetch(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setAdminStats(await res.json());
    } catch {}
  }

  useEffect(() => {
    if (token) { loadTools(); loadStats(); }
  }, [token]);

  async function toggleHidden(tool: Tool) {
    try {
      const res = await fetch(`${API}/admin/tools/${tool.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isHidden: !tool.isHidden }),
      });
      if (!res.ok) throw new Error();
      setTools(prev => prev.map(t => t.slug === tool.slug ? { ...t, isHidden: !t.isHidden } : t));
    } catch {
      toast({ title: "Failed to update tool", variant: "destructive" });
    }
  }

  async function toggleFeatured(tool: Tool) {
    try {
      const res = await fetch(`${API}/admin/tools/${tool.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isFeatured: !tool.isFeatured }),
      });
      if (!res.ok) throw new Error();
      setTools(prev => prev.map(t => t.slug === tool.slug ? { ...t, isFeatured: !t.isFeatured } : t));
    } catch {
      toast({ title: "Failed to update tool", variant: "destructive" });
    }
  }

  async function deleteTool(tool: Tool) {
    if (!confirm(`Delete "${tool.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/admin/tools/${tool.slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setTools(prev => prev.filter(t => t.slug !== tool.slug));
      toast({ title: `"${tool.name}" deleted` });
    } catch {
      toast({ title: "Failed to delete tool", variant: "destructive" });
    }
  }

  if (!token) return <LoginScreen onLogin={handleLogin} />;

  const categories = ["all", ...Array.from(new Set(tools.map(t => t.category)))];
  const filtered = tools.filter(t => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const localStats = {
    total: tools.length,
    hidden: tools.filter(t => t.isHidden).length,
    featured: tools.filter(t => t.isFeatured).length,
    totalUsage: tools.reduce((a, t) => a + t.usageCount, 0),
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg"><Layers className="h-4 w-4 text-primary-foreground" /></div>
            <span className="font-bold">FileZone Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { loadTools(); loadStats(); }}>
            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4 mr-1.5" /> Logout</Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Real Stats from API */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Visitors",
              value: (adminStats?.totalVisitors ?? 0).toLocaleString(),
              icon: <Users className="h-5 w-5 text-blue-500" />,
              sub: "All-time unique visitors",
            },
            {
              label: "Files Processed",
              value: (adminStats?.totalFilesProcessed ?? localStats.totalUsage).toLocaleString(),
              icon: <FileStack className="h-5 w-5 text-green-500" />,
              sub: "Total tool uses",
            },
            {
              label: "Active Tools",
              value: (adminStats ? adminStats.totalTools - adminStats.hiddenTools : localStats.total - localStats.hidden).toString(),
              icon: <TrendingUp className="h-5 w-5 text-primary" />,
              sub: `${adminStats?.hiddenTools ?? localStats.hidden} hidden`,
            },
            {
              label: "Featured Tools",
              value: (adminStats?.featuredTools ?? localStats.featured).toString(),
              icon: <Star className="h-5 w-5 text-amber-500" />,
              sub: "Shown on homepage",
            },
          ].map(s => (
            <div key={s.label} className="bg-card border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                {s.icon}
                <span className="text-xs text-muted-foreground">{s.sub}</span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button variant={activeTab === "tools" ? "default" : "outline"} onClick={() => setActiveTab("tools")} size="sm">
            <BarChart2 className="h-4 w-4 mr-1.5" /> Tools Manager
          </Button>
          <Button variant={activeTab === "stats" ? "default" : "outline"} onClick={() => setActiveTab("stats")} size="sm">
            <TrendingUp className="h-4 w-4 mr-1.5" /> Analytics
          </Button>
          <Button variant={activeTab === "settings" ? "default" : "outline"} onClick={() => setActiveTab("settings")} size="sm">
            <Settings className="h-4 w-4 mr-1.5" /> Site Settings
          </Button>
        </div>

        {/* Analytics Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="bg-card border rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-4">Top Tools by Usage</h2>
              {adminStats?.topTools?.length ? (
                <div className="space-y-3">
                  {adminStats.topTools.map((t, i) => (
                    <div key={t.slug} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{t.name}</span>
                          <span className="text-sm font-mono">{t.usageCount.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.round((t.usageCount / (adminStats.topTools[0]?.usageCount || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <Badge className={cn("text-xs border-0 w-20 justify-center", categoryColors[t.category] ?? "bg-muted")}>{t.category}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No data yet. Usage is tracked when visitors use tools.</p>
              )}
            </div>

            <div className="bg-card border rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-4">Uses by Category</h2>
              {adminStats?.conversionsByCategory?.length ? (
                <div className="space-y-3">
                  {adminStats.conversionsByCategory.sort((a, b) => b.count - a.count).map(cat => {
                    const max = Math.max(...adminStats.conversionsByCategory.map(c => c.count));
                    return (
                      <div key={cat.category} className="flex items-center gap-3">
                        <span className="text-sm capitalize w-20">{cat.category}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.round((cat.count / max) * 100)}%` }} />
                        </div>
                        <span className="text-sm font-mono w-16 text-right">{cat.count.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No category data yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="bg-card border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-5">Site Settings</h2>
            <SettingsPanel token={token} onPasswordChange={() => handleLogout()} />
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === "tools" && (
          <div className="bg-card border rounded-2xl overflow-hidden">
            {/* Filters + Add */}
            <div className="p-4 border-b flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tools…"
                className="max-w-xs"
              />
              <div className="flex gap-2 flex-wrap flex-1">
                {categories.map(cat => (
                  <Button key={cat} variant={categoryFilter === cat ? "default" : "outline"} size="sm"
                    onClick={() => setCategoryFilter(cat)} className="capitalize">
                    {cat}
                  </Button>
                ))}
              </div>
              <Button size="sm" onClick={() => setAddingTool(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Tool
              </Button>
            </div>

            {/* Tools Table */}
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading tools…</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No tools found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tool</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Uses</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((tool) => (
                      <tr key={tool.slug} className={cn("border-t hover:bg-muted/20 transition-colors", tool.isHidden && "opacity-50")}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{tool.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-xs">{tool.description}</p>
                            <p className="text-xs text-muted-foreground font-mono">{tool.slug}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cn("text-xs border-0", categoryColors[tool.category] ?? "bg-muted text-muted-foreground")}>
                            {tool.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">{tool.usageCount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5 flex-wrap">
                            {tool.isFeatured && <Badge className="bg-amber-100 text-amber-700 text-xs border-0">Featured</Badge>}
                            {tool.isHidden && <Badge className="bg-gray-100 text-gray-600 text-xs border-0">Hidden</Badge>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title={tool.isFeatured ? "Unfeature" : "Feature"}
                              onClick={() => toggleFeatured(tool)}>
                              {tool.isFeatured ? <StarOff className="h-3.5 w-3.5 text-amber-500" /> : <Star className="h-3.5 w-3.5" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title={tool.isHidden ? "Show" : "Hide"}
                              onClick={() => toggleHidden(tool)}>
                              {tool.isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit"
                              onClick={() => setEditingTool(tool)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Delete"
                              onClick={() => deleteTool(tool)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-4 py-3 border-t text-xs text-muted-foreground">
              Showing {filtered.length} of {tools.length} tools
            </div>
          </div>
        )}
      </div>

      {editingTool && (
        <EditToolModal
          tool={editingTool}
          token={token}
          onSave={updated => {
            setTools(prev => prev.map(t => t.slug === updated.slug ? updated : t));
            setEditingTool(null);
          }}
          onClose={() => setEditingTool(null)}
        />
      )}

      {addingTool && (
        <AddToolModal
          token={token}
          onAdd={created => {
            setTools(prev => [...prev, created]);
            setAddingTool(false);
          }}
          onClose={() => setAddingTool(false)}
        />
      )}
    </div>
  );
}
