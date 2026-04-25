import type { Namuna8PropertyType } from '@/lib/api/namuna8'

export const NAMUNA8_PROPERTY_TYPE_OPTIONS: Array<{ value: Namuna8PropertyType, label: string }> = [
  { value: 'jhopdi_mati', label: 'झोपडी / मातीचे घर' },
  { value: 'dagad_vit_mati', label: 'दगड-विटा माती' },
  { value: 'dagad_vit_pucca', label: 'दगड-विटा पक्के' },
  { value: 'navi_rcc', label: 'नवीन RCC' },
  { value: 'bakhal', label: 'बखळ / पडसर' },
]

export function propertyTypeLabel(value: string): string {
  const found = NAMUNA8_PROPERTY_TYPE_OPTIONS.find((opt) => opt.value === value)
  return found?.label ?? value
}
