import { db } from '../db';
import { generatedImages, type NewGeneratedImage, type NewUser, users } from '../schema';

export async function insertUser(user: NewUser) {
  return await db.insert(users).values(user).returning();
}

export async function insertGeneratedImage(image: NewGeneratedImage) {
  return await db.insert(generatedImages).values(image).returning();
}
