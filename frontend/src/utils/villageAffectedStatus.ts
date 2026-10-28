import type { VillageAction } from '../data/narayanpurHierarchy';

export function isDirectlyAffected(status: VillageAction): boolean {
  return status === 'Direct Affected' || status === 'Direct and Indirect Both';
}

export function isIndirectlyAffected(status: VillageAction): boolean {
  return status === 'Indirect Affected' || status === 'Direct and Indirect Both';
}
