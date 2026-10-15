import { describe, expect, it } from 'vitest';
import { isValidTotalMembers } from './HouseholdDemography';

describe('total household member count validation', () => {
  it.each(['1', '7', '0007', '10000000', 1, 10000000])('accepts positive integers: %s', (value) => {
    expect(isValidTotalMembers(value)).toBe(true);
  });

  it.each(['', '0', '-1', '1.5', '1e2', '10000001', 0, -1, 1.5, Number.NaN])(
    'rejects invalid member counts: %s',
    (value) => {
      expect(isValidTotalMembers(value)).toBe(false);
    }
  );
});
