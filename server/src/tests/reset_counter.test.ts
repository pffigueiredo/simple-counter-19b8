
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type ResetCounterInput } from '../schema';
import { resetCounter } from '../handlers/reset_counter';
import { eq } from 'drizzle-orm';

describe('resetCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should reset counter to default value (0)', async () => {
    const input: ResetCounterInput = {
      value: 0
    };

    const result = await resetCounter(input);

    expect(result.value).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should reset counter to specified value', async () => {
    const input: ResetCounterInput = {
      value: 42
    };

    const result = await resetCounter(input);

    expect(result.value).toEqual(42);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create new counter if none exists', async () => {
    const input: ResetCounterInput = {
      value: 15
    };

    const result = await resetCounter(input);

    // Verify counter was created in database
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(15);
    expect(counters[0].created_at).toBeInstanceOf(Date);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update existing counter value', async () => {
    // First, create a counter with initial value
    const initialCounter = await db.insert(countersTable)
      .values({ value: 100 })
      .returning()
      .execute();

    const input: ResetCounterInput = {
      value: 25
    };

    const result = await resetCounter(input);

    // Should update the existing counter, not create new one
    expect(result.id).toEqual(initialCounter[0].id);
    expect(result.value).toEqual(25);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify only one counter exists in database
    const allCounters = await db.select()
      .from(countersTable)
      .execute();

    expect(allCounters).toHaveLength(1);
    expect(allCounters[0].value).toEqual(25);
  });

  it('should update timestamp when resetting existing counter', async () => {
    // Create initial counter
    const initialCounter = await db.insert(countersTable)
      .values({ value: 50 })
      .returning()
      .execute();

    const initialUpdatedAt = initialCounter[0].updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: ResetCounterInput = {
      value: 0
    };

    const result = await resetCounter(input);

    expect(result.updated_at.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
    expect(result.value).toEqual(0);
  });
});
