import { Link } from "react-router-dom";
import { TrendingUp, Sparkles, BarChart2, PlayCircle } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Keyword Generation",
    description:
      "Describe your niche in plain language and let Gemini AI generate optimized search keywords.",
  },
  {
    icon: TrendingUp,
    title: "Outlier Score Analysis",
    description:
      "Every video is scored against the channel's average views to surface true outliers.",
  },
  {
    icon: BarChart2,
    title: "Advanced Filters",
    description:
      "Filter by language, video duration, channel size, and publication date to zero in on opportunities.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            Viral<span className="text-red-500">Scout</span>
          </span>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm bg-red-600 hover:bg-red-500 text-white font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-400 font-medium mb-6">
          <PlayCircle size={12} aria-hidden="true" />
          YouTube Research Tool
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-zinc-50 leading-tight mb-6">
          Find viral videos
          <br />
          <span className="text-red-500">before anyone else</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
          AI-powered keyword generation + outlier score analysis surfaces the videos beating
          their channel average by 5–50×.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/register"
            className="bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
          >
            Start for free
          </Link>
          <Link
            to="/login"
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-medium px-6 py-3 rounded-lg transition-colors text-sm"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-red-400" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-zinc-100 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
