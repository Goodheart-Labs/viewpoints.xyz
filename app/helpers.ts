import { db } from "@/db/client";

export async function getPublicPolls() {
  return db
    .selectFrom("polls")
    .selectAll()
    .where("visibility", "=", "public")
    .orderBy("created_at", "desc")
    .execute();
}
