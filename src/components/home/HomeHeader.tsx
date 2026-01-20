"use client";

interface HomeHeaderProps {
  userName?: string;
}

export default function HomeHeader({ userName = "재빈" }: HomeHeaderProps) {
  return (
    <div className="px-4 pt-12 pb-6">
      <h1 className="text-2xl md:text-3xl font-extrabold">
        Ready to Surf,{" "}
        <span className="text-cyan-400">{userName}</span>
        <span className="text-white">님?</span>
      </h1>
    </div>
  );
}

