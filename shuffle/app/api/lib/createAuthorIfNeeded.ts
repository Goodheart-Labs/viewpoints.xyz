import { currentUser } from "@clerk/nextjs";

import prisma from "@/lib/prisma";

export const createAuthorIfNeeded = async () => {
  const user = await currentUser();

  if (!user) {
    return;
  }

  const author = await prisma.author.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!author) {
    await prisma.author.create({
      data: {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        avatarUrl: user.profileImageUrl,
      },
    });
  }
};
