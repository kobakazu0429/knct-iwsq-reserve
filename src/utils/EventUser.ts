export const calcRemaining = (
  limit: number,
  participant: number,
  applicant: number
) => {
  const left = limit - participant;
  if (left > 0 && applicant > 0) return Math.max(0, left - applicant);
  return left;
};

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;
  test("calcRemaining", () => {
    expect(calcRemaining(2, 2, 2)).toBe(0);
    expect(calcRemaining(2, 1, 1)).toBe(0);
    expect(calcRemaining(2, 1, 0)).toBe(1);
    expect(calcRemaining(2, 0, 1)).toBe(1);
    expect(calcRemaining(2, 0, 2)).toBe(0);
    expect(calcRemaining(2, 0, 3)).toBe(0);
  });
}
