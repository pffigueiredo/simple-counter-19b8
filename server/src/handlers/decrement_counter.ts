
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type DecrementCounterInput, type Counter } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const decrementCounter = async (input: DecrementCounterInput): Promise<Counter> => {
  try {
    // Get or create the counter (assuming single counter with id = 1)
    let counter = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, 1))
      .limit(1)
      .execute();

    if (counter.length === 0) {
      // Create initial counter if it doesn't exist
      const result = await db.insert(countersTable)
        .values({
          value: -input.amount, // Start with negative value since we're decrementing
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning()
        .execute();
      
      return result[0];
    }

    // Update existing counter by decrementing the value
    const result = await db.update(countersTable)
      .set({
        value: sql`${countersTable.value} - ${input.amount}`,
        updated_at: new Date()
      })
      .where(eq(countersTable.id, 1))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Counter decrement failed:', error);
    throw error;
  }
};
