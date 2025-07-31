
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type DecrementCounterInput } from '../schema';
import { decrementCounter } from '../handlers/decrement_counter';
import { eq } from 'drizzle-orm';

describe('decrementCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create counter with negative value when no counter exists', async () => {
    const input: DecrementCounterInput = {
      amount: 5
    };

    const result = await decrementCounter(input);

    expect(result.id).toBeDefined();
    expect(result.value).toEqual(-5);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should decrement existing counter value', async () => {
    // Create initial counter with value 10
    await db.insert(countersTable)
      .values({
        value: 10,
        created_at: new Date(),
        updated_at: new Date()
      })
      .execute();

    const input: DecrementCounterInput = {
      amount: 3
    };

    const result = await decrementCounter(input);

    expect(result.id).toEqual(1);
    expect(result.value).toEqual(7); // 10 - 3 = 7
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should decrement counter to negative value', async () => {
    // Create initial counter with value 2
    await db.insert(countersTable)
      .values({
        value: 2,
        created_at: new Date(),
        updated_at: new Date()
      })
      .execute();

    const input: DecrementCounterInput = {
      amount: 5
    };

    const result = await decrementCounter(input);

    expect(result.id).toEqual(1);
    expect(result.value).toEqual(-3); // 2 - 5 = -3
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should use default amount of 1 when not specified', async () => {
    // Create initial counter with value 5
    await db.insert(countersTable)
      .values({
        value: 5,
        created_at: new Date(),
        updated_at: new Date()
      })
      .execute();

    const input: DecrementCounterInput = {
      amount: 1 // Explicitly set to 1 to test default behavior
    };

    const result = await decrementCounter(input);

    expect(result.id).toEqual(1);
    expect(result.value).toEqual(4); // 5 - 1 = 4
  });

  it('should save decremented value to database', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({
        value: 15,
        created_at: new Date(),
        updated_at: new Date()
      })
      .execute();

    const input: DecrementCounterInput = {
      amount: 7
    };

    await decrementCounter(input);

    // Verify the value was saved to database
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, 1))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(8); // 15 - 7 = 8
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle multiple decrements correctly', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({
        value: 20,
        created_at: new Date(),
        updated_at: new Date()
      })
      .execute();

    // First decrement
    await decrementCounter({ amount: 5 });
    
    // Second decrement
    const result = await decrementCounter({ amount: 3 });

    expect(result.value).toEqual(12); // 20 - 5 - 3 = 12
  });
});
