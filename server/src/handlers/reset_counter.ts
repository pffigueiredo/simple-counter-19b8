
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type ResetCounterInput, type Counter } from '../schema';
import { eq } from 'drizzle-orm';

export const resetCounter = async (input: ResetCounterInput): Promise<Counter> => {
  try {
    // First, check if a counter exists
    const existingCounters = await db.select()
      .from(countersTable)
      .limit(1)
      .execute();

    let result;

    if (existingCounters.length > 0) {
      // Update existing counter
      const updatedCounters = await db.update(countersTable)
        .set({
          value: input.value,
          updated_at: new Date()
        })
        .where(eq(countersTable.id, existingCounters[0].id))
        .returning()
        .execute();

      result = updatedCounters[0];
    } else {
      // Create new counter if none exists
      const newCounters = await db.insert(countersTable)
        .values({
          value: input.value
        })
        .returning()
        .execute();

      result = newCounters[0];
    }

    return result;
  } catch (error) {
    console.error('Counter reset failed:', error);
    throw error;
  }
};
