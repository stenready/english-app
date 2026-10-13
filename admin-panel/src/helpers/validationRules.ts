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
}): string => label ?? name

export const ruleRequired: ValidationRule = (value, ctx) =>
  Boolean(value.trim()) ||
  t('validation.required', { field: getFieldName(ctx) })

// Empty value is valid: combine with ruleRequired when the field is mandatory
export const ruleEmail: ValidationRule = (value, ctx) =>
  !value ||
  EMAIL_PATTERN.test(value) ||
  t('validation.email', { field: getFieldName(ctx) })

export const ruleMinLength =
  (min: number): ValidationRule =>
  (value, ctx) =>
    !value ||
    value.length >= min ||
    t('validation.minLength', { field: getFieldName(ctx), min })

export const ruleMaxLength =
  (max: number): ValidationRule =>
  (value, ctx) =>
    value.length <= max ||
    t('validation.maxLength', { field: getFieldName(ctx), max })

// Equal to another field of the same form, e.g. ruleSameAs('password')
export const ruleSameAs =
  (otherField: string): ValidationRule =>
  (value, ctx) =>
    value === ctx.form[otherField] ||
    t('validation.sameAs', { field: getFieldName(ctx) })
