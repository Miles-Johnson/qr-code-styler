import { db } from '../db';
import { generatedImages, users } from '../schema';
import { eq } from 'drizzle-orm';
import { checkImageOwnership } from './select';

export async function deleteUser(id: string) {
  return await db.delete(users).where(eq(users.id, id)).returning();
}

export async function deleteGeneratedImage(imageId: string, userId: string, isAdmin: boolean = false) {
  // If user is admin, allow deletion without ownership check
  if (!isAdmin) {
    const isOwner = await checkImageOwnership(imageId, userId);
    if (!isOwner) {
      throw new Error('Unauthorized: User does not own this image');
    }
  }
  
  return await db.delete(generatedImages).where(eq(generatedImages.id, imageId)).returning();
}

// Delete all generated images for a user (useful when deleting a user account)
export async function deleteUserGeneratedImages(userId: string) {
  return await db.delete(generatedImages).where(eq(generatedImages.userId, userId)).returning();
}
