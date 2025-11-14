/**
 * ブレークポイント関連のユーティリティ
 * Tailwind CSSのブレークポイントに基づいたレイアウト判定機能を提供
 */

/**
 * Tailwind CSS v4のデフォルトブレークポイント
 * @see https://tailwindcss.com/docs/responsive-design
 */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * メディアクエリのマッチャーをキャッシュ
 */
const mediaQueries = {
  '2xl': window.matchMedia(`(min-width: ${BREAKPOINTS['2xl']}px)`),
  xl: window.matchMedia(`(min-width: ${BREAKPOINTS.xl}px)`),
  lg: window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`),
  md: window.matchMedia(`(min-width: ${BREAKPOINTS.md}px)`),
  sm: window.matchMedia(`(min-width: ${BREAKPOINTS.sm}px)`),
};

/**
 * 現在のレイアウト（ブレークポイント）を取得
 * @returns {'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'} 現在のブレークポイント
 */
export function getCurrentBreakpoint() {
  if (mediaQueries['2xl'].matches) {
    return '2xl';
  }
  if (mediaQueries.xl.matches) {
    return 'xl';
  }
  if (mediaQueries.lg.matches) {
    return 'lg';
  }
  if (mediaQueries.md.matches) {
    return 'md';
  }
  if (mediaQueries.sm.matches) {
    return 'sm';
  }
  return 'xs';
}
