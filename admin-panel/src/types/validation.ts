import type { GenericValidateFunction } from 'vee-validate'

// Returns true when valid, otherwise the (localized) error message.
// The 2nd argument (ctx) gives label, name and the values of the whole form
export type ValidationRule<TValue = string> = GenericValidateFunction<TValue>
