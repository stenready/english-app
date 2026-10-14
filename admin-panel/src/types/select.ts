// value can be anything: a string, a number, an object…
export interface AppSelectOption<TValue = unknown> {
  value: TValue
  label: string
}
