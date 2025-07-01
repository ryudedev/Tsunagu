import AuthenticatedRoute from "@/components/AuthenticatedRoute";

export default function Home() {
  return (
    <AuthenticatedRoute>
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Tsunaguへようこそ！</h1>
        <p className="text-lg text-gray-700">社内の知見やノウハウを共有し、繋がりを深めましょう。</p>
        
      </div>
    </AuthenticatedRoute>
  );
}
