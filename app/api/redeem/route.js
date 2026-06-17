import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const sql = getSql();
  try {
    const body = await request.json();

    const couponId = body.couponId;
    const storeCode = body.storeCode;
    const hashedStoreCode = crypto
      .createHash("sha256")
      .update(storeCode)
      .digest("hex");

    const coupons = await sql`
      SELECT *
      FROM coupons
      WHERE coupon_id = ${couponId};
    `;

    if (coupons.length === 0) {
      return NextResponse.json({
        success: false,
        error: "クーポンが存在しません",
        fatal: true
      });
    }

    const coupon = coupons[0];

    if (!coupon.is_enabled) {
      return NextResponse.json({
        success: false,
        error: "無効なクーポンです",
        fatal: true
      });
    }

    if (coupon.is_used) {
      return NextResponse.json({
        success: false,
        error: "使用済みです",
        fatal: true
      });
    }

    if (new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({
        success: false,
        error: "期限切れです",
        fatal: true
      });
    }

    if (coupon.store_code !== hashedStoreCode) {
      return NextResponse.json({
        success: false,
        error: "店舗識別コードが無効です",
        fatal: false
      });
    }

    return NextResponse.json({
      success: true,
      fatal: false
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      error: "サーバーエラー"
    }, {
      status: 500
    });
  }
}