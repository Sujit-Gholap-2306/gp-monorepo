import type { GramNavItem } from '../gram-types'

/** Longest href wins so `/utaras/new` matches before `/utaras`. */
export function resolveActiveNavItem(
  items: GramNavItem[],
  pathname: string,
): GramNavItem | undefined {
  const sorted = [...items].sort((a, b) => b.href.length - a.href.length)
  return sorted.find(n => (n.exact ? pathname === n.href : pathname.startsWith(n.href)))
}
