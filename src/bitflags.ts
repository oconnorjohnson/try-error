/**
 * Bit flag implementation for performance optimization
 *
 * This module provides bit flag utilities to reduce memory usage
 * by packing multiple boolean values into a single number.
 */

/**
 * Bit flags for TryError boolean properties
 */
export const enum ErrorFlags {
  None = 0,
  HasStack = 1 << 0,
  HasContext = 1 << 1,
  HasCause = 1 << 2,
  IsProduction = 1 << 3,
  IsLazy = 1 << 4,
  IsPooled = 1 << 5,
  IsMinimal = 1 << 6,
}

/**
 * Set a flag
 */
export function setFlag(flags: number, flag: ErrorFlags): number {
  return flags | flag;
}

/**
 * Clear a flag
 */
export function clearFlag(flags: number, flag: ErrorFlags): number {
  return flags & ~flag;
}

/**
 * Check if a flag is set
 */
export function hasFlag(flags: number, flag: ErrorFlags): boolean {
  return (flags & flag) === flag;
}

/**
 * Toggle a flag
 */
export function toggleFlag(flags: number, flag: ErrorFlags): number {
  return flags ^ flag;
}

/**
 * Set multiple flags at once
 */
export function setFlags(flags: number, ...flagsToSet: ErrorFlags[]): number {
  return flagsToSet.reduce((acc, flag) => acc | flag, flags);
}

/**
 * Check if all specified flags are set
 */
export function hasAllFlags(
  flags: number,
  ...flagsToCheck: ErrorFlags[]
): boolean {
  const combined = flagsToCheck.reduce((acc, flag) => acc | flag, 0);
  return (flags & combined) === combined;
}

/**
 * Check if any of the specified flags are set
 */
export function hasAnyFlag(
  flags: number,
  ...flagsToCheck: ErrorFlags[]
): boolean {
  return flagsToCheck.some((flag) => (flags & flag) === flag);
}

/**
 * Create a flag set from boolean values
 */
export function createFlags(options: {
  hasStack?: boolean;
  hasContext?: boolean;
  hasCause?: boolean;
  isProduction?: boolean;
  isLazy?: boolean;
  isPooled?: boolean;
  isMinimal?: boolean;
}): number {
  let flags = ErrorFlags.None;

  if (options.hasStack) flags = setFlag(flags, ErrorFlags.HasStack);
  if (options.hasContext) flags = setFlag(flags, ErrorFlags.HasContext);
  if (options.hasCause) flags = setFlag(flags, ErrorFlags.HasCause);
  if (options.isProduction) flags = setFlag(flags, ErrorFlags.IsProduction);
  if (options.isLazy) flags = setFlag(flags, ErrorFlags.IsLazy);
  if (options.isPooled) flags = setFlag(flags, ErrorFlags.IsPooled);
  if (options.isMinimal) flags = setFlag(flags, ErrorFlags.IsMinimal);

  return flags;
}
