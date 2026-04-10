import { Player } from '@/types';

/**
 * Parses a pasted player list in the format:
 *   1- Reis ⚽
 *   2- Trabuco ❌ (Danilo)
 *   3- (Eduardo)
 *
 * Returns the final list of confirmed players:
 * - ⚽ = confirmed
 * - ❌ (Replacement) = absent, replacement plays instead
 * - (Name) = guest/extra player
 * - No emoji = assumed confirmed
 */
export function parsePlayerList(text: string): Player[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const players: Player[] = [];
  let id = 1;

  for (const line of lines) {
    // Remove leading number + dash: "1- " or "1." or "1)" or just "- "
    const cleaned = line.replace(/^\d+[\-\.\)]\s*/, '').replace(/^[\-]\s*/, '').trim();
    if (!cleaned) continue;

    const isAbsent = cleaned.includes('❌');
    const isConfirmed = cleaned.includes('⚽') || cleaned.includes('⚽️');

    if (isAbsent) {
      // Format: "Trabuco ❌ (Danilo)" → Danilo plays
      const replacementMatch = cleaned.match(/\(([^)]+)\)/);
      if (replacementMatch) {
        const replacementName = replacementMatch[1].trim();
        players.push({
          id: `parsed-${id++}`,
          name: replacementName,
          goalCount: 0,
          status: 'active',
        });
      }
      // If no replacement in parens, the absent player just doesn't play
      continue;
    }

    // Check for parenthesized name: "(Eduardo)" → guest
    const parenMatch = cleaned.match(/^\(([^)]+)\)$/);
    if (parenMatch) {
      players.push({
        id: `parsed-${id++}`,
        name: parenMatch[1].trim(),
        goalCount: 0,
        status: 'active',
      });
      continue;
    }

    // Normal confirmed player: "Reis ⚽" or "João"
    const name = cleaned
      .replace(/⚽️?/g, '')
      .replace(/️/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (name) {
      players.push({
        id: `parsed-${id++}`,
        name,
        goalCount: 0,
        status: 'active',
      });
    }
  }

  return players;
}
