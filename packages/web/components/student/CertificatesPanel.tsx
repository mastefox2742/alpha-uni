'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useStudentCertificates, type CertEntry } from '@/lib/hooks/useStudentCertificates'

const CERT_LABELS: Record<string, { label: string; icon: string }> = {
  enrollment:  { label: 'Certificat de scolarité',    icon: '🎓' },
  transcript:  { label: 'Relevé de notes officiel',   icon: '📋' },
  degree:      { label: 'Diplôme',                    icon: '🏅' },
  attendance:  { label: 'Attestation de présence',    icon: '📅' },
  other:       { label: 'Document officiel',          icon: '📄' },
}

export function CertificatesPanel() {
  const { data: certs, isLoading, isError } = useStudentCertificates()
  const API = process.env.NEXT_PUBLIC_API_URL ?? ''

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1,2].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}
      </div>
    )
  }

  if (isError) {
    return <p className="text-sm text-destructive">Impossible de charger les certificats.</p>
  }

  if (!certs || certs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        <p className="text-3xl">📄</p>
        <p className="mt-2 text-sm">Aucun certificat émis pour le moment.</p>
        <p className="mt-1 text-xs">Contactez le secrétariat pour demander un document officiel.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {certs.map((cert: CertEntry) => {
        const info      = CERT_LABELS[cert.type] ?? CERT_LABELS.other!
        const secretary = (cert.secretaries as any)?.profiles
        const isExpired = cert.expires_at ? new Date(cert.expires_at) < new Date() : false

        return (
          <div
            key={cert.id}
            className={`rounded-xl border bg-card p-4 shadow-sm ${isExpired ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{info.icon}</span>
                <div>
                  <p className="font-medium">
                    {info.label}
                    {isExpired && (
                      <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Expiré
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Émis le {format(new Date(cert.issued_at), 'd MMMM yyyy', { locale: fr })}
                    {secretary && ` par ${secretary.first_name} ${secretary.last_name}`}
                  </p>
                  {cert.serial_number && (
                    <p className="text-xs text-muted-foreground font-mono">{cert.serial_number}</p>
                  )}
                  {cert.expires_at && (
                    <p className="text-xs text-muted-foreground">
                      Valide jusqu'au {format(new Date(cert.expires_at), 'd MMM yyyy', { locale: fr })}
                    </p>
                  )}
                </div>
              </div>

              <a
                href={`${API}/api/certificates/${cert.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                ⬇️ PDF
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}
