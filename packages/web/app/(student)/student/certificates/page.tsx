import type { Metadata } from 'next'
import { CertificatesPanel } from '@/components/student/CertificatesPanel'

export const metadata: Metadata = { title: 'Certificats — Étudiant' }

export default function StudentCertificatesPage() {
  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mes certificats</h1>
        <p className="mt-1 text-muted-foreground">
          Téléchargez vos certificats officiels émis par le secrétariat.
        </p>
      </div>
      <CertificatesPanel />
    </div>
  )
}
