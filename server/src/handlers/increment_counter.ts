
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type IncrementCounterInput, type Counter } from '../schema';
import { sql } from 'drizzle-orm';

export const incrementCounter = async (input: IncrementCounterInput): Promise<Counter> => {
  try {
    // First check if a counter exists
    const existing = await db.select()
      .from(countersTable)
      .limit(1)
      .execute();

    if (existing.length === 0) {
      // Create a new counter with the increment amount as initial value
      const result = await db.insert(countersTable)
        .values({
          value: input.amount,
          updated_at: new Date()
        })
        .returning()
        .execute();

      return result[0];
    } else {
      // Update existing counter by incrementing its value
      const result = await db.update(countersTable)
        .set({
          value: sql`${countersTable.value} + ${input.amount}`,
          updated_at: new Date()
        })
        .returning()
        .execute();

      return result[0];
    }
  } catch (error) {
    console.error('Counter increment failed:', error);
    throw error;
  }
};
