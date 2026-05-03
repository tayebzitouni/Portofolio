import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#05070c] px-4 text-white">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <AlertCircle className="h-8 w-8 text-[#fb7185]" />
          <h1 className="text-2xl font-bold">404 Page Not Found</h1>
        </div>
        <p className="text-sm text-slate-300">
          This route does not exist in the portfolio.
        </p>
      </div>
    </div>
  );
}
