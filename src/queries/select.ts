import { db } from '../db';
import { generatedImages, users, type GeneratedImage, type User } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getUserById(id: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0];
}

// Get a single generated image by ID
export async function getGeneratedImageById(id: string): Promise<GeneratedImage | undefined> {
  const result = await db.select().from(generatedImages).where(eq(generatedImages.id, id));
  return result[0];
}

// Get all generated images for a specific user
export async function getGeneratedImagesByUserId(userId: string): Promise<GeneratedImage[]> {
  return await db
    .select()
    .from(generatedImages)
    .where(eq(generatedImages.userId, userId))
    .orderBy(desc(generatedImages.createdAt)); // Order by newest first
}

// Get a generated image by prediction ID
export async function getGeneratedImageByPredictionId(predictionId: string): Promise<GeneratedImage | undefined> {
  const result = await db.select().from(generatedImages).where(eq(generatedImages.predictionId, predictionId));
  return result[0];
}

// Check if a user owns a generated image
export async function checkImageOwnership(imageId: string, userId: string): Promise<boolean> {
  const image = await getGeneratedImageById(imageId);
  return image?.userId === userId;
}
