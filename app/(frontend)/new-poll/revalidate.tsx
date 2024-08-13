import { revalidatePath } from "next/cache";

export async function revalidateUserPolls() {
  "use server";

  revalidatePath("/user/polls");
}
