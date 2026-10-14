import i18n from '@/plugins/i18n'
import type { ValidationRule } from '@/types/validation'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const { t } = i18n.global

// Field name for messages: the label, or the field name when there is none
const getFieldName = ({
  label,
  name,
}: {
  label?: string
  name: string
}): string => {
  return label ?? name
}

// Empty: null / undefined (nothing chosen in a select) or a blank string
const isEmpty = (value: unknown): boolean => {
  return (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && !value.trim())
  )
}

// Any field type: inputs (string), selects (value | null)…
export const ruleRequired: ValidationRule<unknown> = (value, ctx) => {
  return (
    !isEmpty(value) || t('validation.required', { field: getFieldName(ctx) })
  )
}

// Empty value is valid: combine with ruleRequired when the field is mandatory
export const ruleEmail: ValidationRule = (value, ctx) => {
  return (
    !value ||
    EMAIL_PATTERN.test(value) ||
    t('validation.email', { field: getFieldName(ctx) })
  )
}

export const ruleMinLength = (min: number): ValidationRule => {
  return (value, ctx) =>
    !value ||
    value.length >= min ||
    t('validation.minLength', { field: getFieldName(ctx), min })
}

export const ruleMaxLength = (max: number): ValidationRule => {
  return (value, ctx) =>
    value.length <= max ||
    t('validation.maxLength', { field: getFieldName(ctx), max })
}

// Equal to another field of the same form, e.g. ruleSameAs('password')
export const ruleSameAs = (otherField: string): ValidationRule => {
  return (value, ctx) =>
    value === ctx.form[otherField] ||
    t('validation.sameAs', { field: getFieldName(ctx) })
}
