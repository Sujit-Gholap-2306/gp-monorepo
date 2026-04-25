import { AlertTriangle } from 'lucide-react'
import type { Namuna8RateMasterStatus } from '@/lib/api/namuna8'
import { propertyTypeLabel } from '@/lib/namuna8/property-type-options'

type Props = {
  rateMaster: Namuna8RateMasterStatus
  /** "list" = link to import; "detail" = compact note for print draft */
  variant?: 'list' | 'detail'
  /** e.g. when all types missing and list is empty (list only) */
  allTypesMissingAndNoProperties?: boolean
}

function labelKeys(keys: string[]): string {
  return keys.map((k) => propertyTypeLabel(k)).join(' · ')
}

export function RateMasterWarning({
  rateMaster,
  variant = 'list',
  allTypesMissingAndNoProperties = false,
}: Props) {
  if (rateMaster.isComplete) return null

  const hasNaviRccGap =
    rateMaster.missingPropertyTypes.includes('navi_rcc')
    || rateMaster.incompletePropertyTypes.includes('navi_rcc')

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Rate master अपूर्ण / तपासणी बाकी</p>
          <p className="text-xs text-amber-800">
            {variant === 'list'
              ? 'प्रत्येक मालमत्ता प्रकारासाठी rate master मध्ये भूमि/इमारत दर + दिवाबत्ती·स्वच्छता·पाणी (default paise) भरा. नवीन RCC साठी "नवीन बांधकाम दर" (₹/ft²) अनिवार्य आहे. यादी तात्पुरती दाखवतो; final assessment आधी मास्टर पूर्ण करा.'
              : 'हा प्रिंट ड्राफ्ट मोड आहे. Final assessment confirm करण्याआधी rate master — खास करून नवीन RCC साठी नवीन बांधकाम दर — verify करा.'}
          </p>
          {variant === 'list' && allTypesMissingAndNoProperties && (
            <p className="mt-1 text-xs text-amber-800">
              या GP मध्ये rate master आणि properties data अजून आयात केलेले नाहीत.
            </p>
          )}
          {rateMaster.missingPropertyTypes.length > 0 && (
            <p className="mt-1 text-xs text-amber-800">
              <span className="font-medium">Row नाही (प्रकार):</span> {labelKeys(rateMaster.missingPropertyTypes)}
            </p>
          )}
          {rateMaster.incompletePropertyTypes.length > 0 && (
            <p className="mt-1 text-xs text-amber-800">
              <span className="font-medium">काही दर/rate रिकामे (प्रकार):</span>{' '}
              {labelKeys(rateMaster.incompletePropertyTypes)}
            </p>
          )}
          {hasNaviRccGap && (
            <p className="mt-1 text-xs text-amber-900">
              <span className="font-medium">नवीन RCC:</span> मास्टर Import किंवा संपादनात &quot;नवीन बांधकाम दर प्रति
              ft²&quot; (new construction rate) सेट करा — तोच दर imarat/भागासाठी वापरतो.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
