import { db } from "@/db/client";

export async function getPolls() {
  return db
    .selectFrom("polls")
    .selectAll()
    .where("visibility", "=", "public")
    .execute();
}
