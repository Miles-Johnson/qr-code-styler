import { db } from '../db';
import { generatedImages, users, type GeneratedImage, type User } from '../schema';
import { eq } from 'drizzle-orm';
import { checkImageOwnership } from './select';

export async function updateUser(id: string, data: Partial<User>) {
  return await db.update(users).set(data).where(eq(users.id, id)).returning();
}

export async function updateGeneratedImage(
  imageId: string,
  userId: string,
  data: Partial<GeneratedImage>,
  isAdmin: boolean = false
) {
  // If user is not admin, verify ownership
  if (!isAdmin) {
    const isOwner = await checkImageOwnership(imageId, userId);
    if (!isOwner) {
      throw new Error('Unauthorized: User does not own this image');
    }
  }

  // Don't allow updating userId to prevent ownership transfer
  const { userId: _, ...updateData } = data;

  return await db
    .update(generatedImages)
    .set(updateData)
    .where(eq(generatedImages.id, imageId))
    .returning();
}
