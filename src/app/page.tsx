import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-900 p-4 text-white">
      <h1 className="text-4xl font-bold">Festival App Proto</h1>
      <div className="flex gap-4">
        <Link href="/timetable" className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 transition">
          Timetable 페이지로 이동
        </Link>
        <Link href="/lookup" className="rounded-lg bg-green-600 px-6 py-3 font-semibold hover:bg-green-700 transition">
          Look-up 페이지로 이동
        </Link>
      </div>
    </main>
  );
}