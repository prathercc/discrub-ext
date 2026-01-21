/**
 * Adaptive Delay Manager
 * 
 * Dynamically adjusts API request delays based on rate limit responses (429).
 * - Uses user's configured delays as the base
 * - Increments delay when 429 is encountered
 * - Slowly decrements delay after successful requests (down to base)
 */

// Increment/decrement values
const DELAY_INCREMENT = 0.5; // How much to increase on 429
const DELAY_DECREMENT = 0.1; // How much to decrease on success
const MAX_DELAY = 30.0; // Maximum delay cap

// Singleton state - these track the ADDITIONAL delay on top of base
let searchDelayOffset = 0;
let deleteDelayOffset = 0;

/**
 * Get the current adaptive search delay offset
 */
export const getSearchDelayOffset = (): number => {
  return searchDelayOffset;
};

/**
 * Get the current adaptive delete delay offset
 */
export const getDeleteDelayOffset = (): number => {
  return deleteDelayOffset;
};

/**
 * Called when a search request encounters a 429
 * Increases the search delay offset
 */
export const onSearchRateLimited = (baseDelay: number): void => {
  const newTotal = baseDelay + searchDelayOffset + DELAY_INCREMENT;
  if (newTotal <= MAX_DELAY) {
    searchDelayOffset += DELAY_INCREMENT;
  }
  console.warn(`[AdaptiveDelay] Search delay offset increased to +${searchDelayOffset.toFixed(2)}s (total: ${(baseDelay + searchDelayOffset).toFixed(2)}s)`);
};

/**
 * Called when a delete request encounters a 429
 * Increases the delete delay offset
 */
export const onDeleteRateLimited = (baseDelay: number): void => {
  const newTotal = baseDelay + deleteDelayOffset + DELAY_INCREMENT;
  if (newTotal <= MAX_DELAY) {
    deleteDelayOffset += DELAY_INCREMENT;
  }
  console.warn(`[AdaptiveDelay] Delete delay offset increased to +${deleteDelayOffset.toFixed(2)}s (total: ${(baseDelay + deleteDelayOffset).toFixed(2)}s)`);
};

/**
 * Called after a successful search request
 * Slowly decreases the search delay offset toward 0
 */
export const onSearchSuccess = (): void => {
  if (searchDelayOffset > 0) {
    searchDelayOffset = Math.max(searchDelayOffset - DELAY_DECREMENT, 0);
  }
};

/**
 * Called after a successful delete request
 * Slowly decreases the delete delay offset toward 0
 */
export const onDeleteSuccess = (): void => {
  if (deleteDelayOffset > 0) {
    deleteDelayOffset = Math.max(deleteDelayOffset - DELAY_DECREMENT, 0);
  }
};
