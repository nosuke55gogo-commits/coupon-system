"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";

function RedeemContent() {
  const searchParams = useSearchParams();
  const couponId = searchParams.get("couponId");
  const router = useRouter();

  const [storeCode, setStoreCode] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(true);
  const [couponOk, setCouponOk] = useState(false);

  useEffect(() => {
    async function checkCouponInfo() {
      try {
        const response = await fetch("/api/coupon-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            couponId,
          }),
        });
        const data = await response.json();
        if (data.success) {
          setCouponOk(true);
          setResult("✅ 利用可能なクーポンです");
        } else {
          setCouponOk(false);
          setResult(`❌️ ${data.error}`);
        }
      } catch (error) {
        console.error(error);
        setResult("❌ サーバーエラー");
      } finally {
        setLoading(false);
      }
    }
    if (couponId) {
      checkCouponInfo();
    } else {
      setResult("❌ クーポンIDがありません");
      setLoading(false);
    }
  }, [couponId]);

  async function checkCoupon() {
    try {
      const response = await fetch("/api/redeem", {
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
        sessionStorage.setItem("storeCode", storeCode);
        router.push(`/redeem/confirm?couponId=${couponId}`);
      } else {
        setResult(`❌ ${data.error}`);
        if (data.fatal) {
          setCouponOk(false);
        }
      }
    } catch (error) {
      console.error(error);
      setResult("❌ サーバーエラー");
    }
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md border rounded-xl p-6 shadow-md flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center">クーポン確認</h1>
        <p className="break-all text-center">クーポンID: {couponId}</p>
        {loading && <p className="text-center">判定中...</p>}
        {!loading && <p className="text-center">{result}</p>}
        {!loading && couponOk && (
          <>
            <input
              type="text"
              placeholder="店舗識別コードを入力"
              value={storeCode}
              onChange={(e) => setStoreCode(e.target.value)}
              className="border rounded p-2"
            />
            <button className="py-2 px-4 border rounded" onClick={checkCoupon}>
              確認
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default function RedeemPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex justify-center items-center">
        <p>読み込み中...</p>
      </main>
    }>
      <RedeemContent />
    </Suspense>
  );
}