import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  const sql = getSql();
  try {
    const body = await request.json();

    const couponId = body.couponId;

    const coupons = await sql`
      SELECT *
      FROM coupons
      WHERE coupon_id = ${couponId};
    `;

    if (coupons.length === 0) {
      return NextResponse.json({
        success: false,
        error: "クーポンが存在しません"
      });
    }

    const coupon = coupons[0];

    if (!coupon.is_enabled) {
      return NextResponse.json({
        success: false,
        error: "無効なクーポンです"
      });
    }

    if (coupon.is_used) {
      return NextResponse.json({
        success: false,
        error: "使用済みです"
      });
    }

    if (new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({
        success: false,
        error: "期限切れです"
      });
    }

    return NextResponse.json({
      success: true,
      coupon: coupon
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