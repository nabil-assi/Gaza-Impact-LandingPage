import { useState } from "react";

// قم بإنشاء ملف جديد في src/components/DonateForm.tsx
export function DonateForm({ initiativeId = "general" }: { initiativeId?: string }) {
  const [amount, setAmount] = useState<number>(50);
  const [method, setMethod] = useState<"binance" | "crypto">("binance");
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    setLoading(true);
    // منطق الـ API هنا
    console.log(`Donating ${amount} via ${method} to ${initiativeId}`);
    // محاكاة تأخير
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      {/* ضع هنا الـ UI الخاص باختيار المبلغ وطريقة الدفع */}
      {/* استخدم setLoading(true) عند الضغط على زر التبرع */}
      <button 
        onClick={handleDonate}
        disabled={loading}
        className="w-full bg-primary py-3 rounded-full text-white font-bold"
      >
        {loading ? "Processing..." : "Donate Now"}
      </button>
    </div>
  );
}