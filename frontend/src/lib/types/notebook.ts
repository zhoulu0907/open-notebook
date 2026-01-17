/**
 * Shared notebook types
 */

/**
 * Context mode for sources and notes in a notebook
 * - off: Not included in chat context
 * - insights: Only AI-generated insights included
 * - full: Full content included
 */
export type ContextMode = 'off' | 'insights' | 'full'

/**
 * Selection state for sources and notes in a notebook
 */
export interface ContextSelections {
  sources: Record<string, ContextMode>
  notes: Record<string, ContextMode>
}
