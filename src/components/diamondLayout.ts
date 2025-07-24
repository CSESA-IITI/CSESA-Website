// diamondLayout.ts
export function getDiamondGridRows(cards: any[]): any[][] {
  // e.g., [1,2,3,2,1] for 9 cards; tune as you like for other counts
  const total = cards.length;
  const structure = total < 5 ? [1, 2, 1] : [1, 2, 3, 2, 1];
  let idx = 0;
  return structure.map(count => {
    const row = cards.slice(idx, idx + count);
    idx += count;
    return row;
  }).filter(row => row.length > 0);
}
