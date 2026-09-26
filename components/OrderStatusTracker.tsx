const STEPS = [
  { key: "pending", label: "Pending" },
  { key: "ready_to_ship", label: "Ready to Ship" },
  { key: "shipped", label: "Shipped" },
];

export default function OrderStatusTracker({ status }: { status: string }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center mb-6">
      {STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: reached ? "var(--sc-accent)" : "var(--sc-border)",
                  color: reached ? "#fff" : "var(--sc-faint)",
                }}
              >
                {reached ? "✓" : i + 1}
              </div>
              <span
                className="text-[11px] mt-1.5 whitespace-nowrap"
                style={{ color: reached ? "var(--sc-ink)" : "var(--sc-faint)" }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 mb-4"
                style={{ background: i < currentIndex ? "var(--sc-accent)" : "var(--sc-border)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}