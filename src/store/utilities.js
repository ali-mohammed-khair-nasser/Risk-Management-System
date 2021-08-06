// Update state in immutable way function:
// =======================================
// This function take the old state and distribute it then overwrite the old values with the new ons
export const updateState = ( state, updatedValues ) => ({ ...state, ...updatedValues });