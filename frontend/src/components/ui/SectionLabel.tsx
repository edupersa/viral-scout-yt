interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );
}
