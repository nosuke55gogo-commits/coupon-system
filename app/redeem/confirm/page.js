"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const couponId = searchParams.get("couponId");
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        const storeCode = typeof window !== "undefined" ? sessionStorage.getItem("storeCode") : null;
        
        if (!storeCode) {
          router.replace("/redeem");
          return;
        }
        const response = await fetch("/api/redeem", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            couponId, storeCode,
          }),
        });
        const data = await response.json();
        if (!data.success) {
          console.error(
            "Confirm verification failed:",
            data.error
          );
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("storeCode");
          }
          router.replace(`/redeem?couponId=${couponId}`);
          return;
        }
      } catch (error) {
        console.error(error);
        router.replace(`/redeem?couponId=${couponId}`);
        return;
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [couponId, router]);

  async function consumeCoupon() {
    try {
      const storeCode = typeof window !== "undefined" ? sessionStorage.getItem("storeCode") : null;
      
      const response = await fetch("/api/consume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponId,
          storeCode,
        }),
      });
      const data = await response.json();
      if (data.success) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("storeCode");
        }
        router.replace(`/redeem/complete?couponId=${couponId}`);
      } else {
        router.replace(`/redeem?couponId=${couponId}`);
      }
    } catch (error) {
      console.error(error);
      router.replace(`/redeem?couponId=${couponId}`);
    }
  }

  function goBack() {
    router.back();
  }

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <p>再確認中...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex justify-center items-center p-4">
      <div className="w-full max-w-md border rounded-xl p-6 shadow-md flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center">
          消込確認
        </h1>
        <p className="break-all text-center">
          クーポンID: {couponId}
        </p>
        <p className="text-center">
          このクーポンを消し込みますか？
        </p>
        <button className="py-2 px-4 border rounded" onClick={consumeCoupon}>
          消込
        </button>
        <button className="py-2 px-4 border rounded" onClick={goBack}>
          戻る
        </button>
      </div>
    </main>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex justify-center items-center">
        <p>読み込み中...</p>
      </main>
    }>
      <ConfirmContent />
    </Suspense>
  );
}