import Link from 'next/link'

export function MarketingFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-gp-border bg-background mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-gp-primary text-gp-primary-fg flex items-center justify-center font-display font-extrabold">
                ग्रा
              </div>
              <span className="font-display font-bold text-foreground">GramPanchayat</span>
            </div>
            <p className="mt-3 text-sm text-gp-muted max-w-sm">
              महाराष्ट्रातील ग्रामपंचायतींसाठी आधुनिक डिजिटल पोर्टल. घोषणा, कार्यक्रम, फोटो व प्रशासन — एकाच ठिकाणी.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gp-muted mb-3">उत्पादन</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/landing#features" className="text-foreground/80 hover:text-gp-primary transition-colors cursor-pointer">वैशिष्ट्ये</Link></li>
              <li><Link href="/pricing" className="text-foreground/80 hover:text-gp-primary transition-colors cursor-pointer">किंमत</Link></li>
              <li><Link href="/customers" className="text-foreground/80 hover:text-gp-primary transition-colors cursor-pointer">ग्राहक</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gp-muted mb-3">सुरुवात</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/signup" className="text-foreground/80 hover:text-gp-primary transition-colors cursor-pointer">साइन अप</Link></li>
              <li><a href="mailto:hello@grampanchayat.co.in" className="text-foreground/80 hover:text-gp-primary transition-colors cursor-pointer">संपर्क</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-gp-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gp-muted">
          <p>© {year} GramPanchayat. सर्व हक्क राखीव.</p>
          <p>Made in India · महाराष्ट्र</p>
        </div>
      </div>
    </footer>
  )
}
