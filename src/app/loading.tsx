import BookLoader from "@/components/BookLoader";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <BookLoader size={48} className="text-[#C5837B]" />
    </div>
  );
}
