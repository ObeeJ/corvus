import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111318] grid-bg p-4">
      <div className="w-full max-w-[380px]">
        <Link href="/" className="flex items-center justify-center mb-10">
          <Logo size={22} wordmarkClassName="text-white/70 text-[12px]" />
        </Link>
        <div className="bg-[#181b22] border border-white/[0.07] p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
