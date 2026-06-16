import { neon } from '@neondatabase/serverless';
export const getSql = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL が環境変数に設定されていません。");
  }
  return neon(process.env.DATABASE_URL);
};