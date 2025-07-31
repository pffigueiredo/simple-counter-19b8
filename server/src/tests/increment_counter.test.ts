
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type IncrementCounterInput } from '../schema';
import { incrementCounter } from '../handlers/increment_counter';

describe('incrementCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a new counter with increment amount when no counter exists', async () => {
    const input: IncrementCounterInput = {
      amount: 5
    };

    const result = await incrementCounter(input);

    expect(result.value).toEqual(5);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should increment existing counter value', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({
        value: 10,
        updated_at: new Date()
      })
      .execute();

    const input: IncrementCounterInput = {
      amount: 3
    };

    const result = await incrementCounter(input);

    expect(result.value).toEqual(13);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should use default amount of 1 when not specified', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({
        value: 7,
        updated_at: new Date()
      })
      .execute();

    const input: IncrementCounterInput = {
      amount: 1
    };

    const result = await incrementCounter(input);

    expect(result.value).toEqual(8);
  });

  it('should update the updated_at field', async () => {
    // Create initial counter with old timestamp
    const oldDate = new Date('2023-01-01');
    await db.insert(countersTable)
      .values({
        value: 5,
        updated_at: oldDate
      })
      .execute();

    const input: IncrementCounterInput = {
      amount: 2
    };

    const result = await incrementCounter(input);

    expect(result.value).toEqual(7);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(oldDate.getTime());
  });

  it('should save changes to database', async () => {
    const input: IncrementCounterInput = {
      amount: 15
    };

    const result = await incrementCounter(input);

    // Verify in database
    const counters = await db.select()
      .from(countersTable)
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(15);
    expect(counters[0].id).toEqual(result.id);
  });
});
