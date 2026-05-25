import type { Metadata } from 'next'
import { CertificateIssuer } from '@/components/admin/CertificateIssuer'

export const metadata: Metadata = { title: 'Certificats — Administration' }

export default function AdminCertificatesPage() {
  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gestion des certificats</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Émettez des certificats officiels pour les étudiants et téléchargez les PDFs.
        </p>
      </div>
      <CertificateIssuer />
    </div>
  )
}
