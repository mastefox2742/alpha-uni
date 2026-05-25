'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { useAdminCertificates, useIssueCertificate } from '@/lib/hooks/useAdminFees'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

const CERT_TYPES = [
  { value: 'enrollment',  label: 'Certificat de scolarité' },
  { value: 'transcript',  label: 'Relevé de notes officiel' },
  { value: 'attendance',  label: 'Attestation de présence' },
  { value: 'degree',      label: 'Diplôme' },
  { value: 'other',       label: 'Document officiel' },
]

function useActiveStudents() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['active-students-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('students')
        .select('id, matricola, profiles!user_id(first_name, last_name, email)')
        .in('status', ['enrolled', 'active'])
        .order('created_at', { ascending: false })
      return (data ?? []) as any[]
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function CertificateIssuer() {
  const [type, setType]               = useState('enrollment')
  const [studentId, setStudentId]     = useState('')
  const [expiresAt, setExpiresAt]     = useState('')
  const [filterType, setFilterType]   = useState('')
  const [studentSearch, setStudentSearch] = useState('')

  const { data: students, isLoading: loadingStudents } = useActiveStudents()
  const certFilter = filterType ? { type: filterType } : {}
  const { data: certs, isLoading: loadingCerts } = useAdminCertificates(certFilter)
  const { mutateAsync: issue, isPending }               = useIssueCertificate()

  const filteredStudents = (students ?? []).filter((s: any) => {
    const profile = s.profiles
    const name    = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''} ${s.matricola ?? ''}`.toLowerCase()
    return name.includes(studentSearch.toLowerCase())
  })

  async function handleIssue() {
    if (!studentId) { toast.error('Sélectionnez un étudiant'); return }
    try {
      const issueInput: Parameters<typeof issue>[0] = { studentId, type }
      if (expiresAt) issueInput.expiresAt = expiresAt
      const result = await issue(issueInput)
      const certId = result.data?.id
      toast.success('Certificat émis')
      setStudentId('')
      setExpiresAt('')
      // Ouvrir le PDF directement
      if (certId) {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          window.open(`${API}/api/certificates/${certId}/pdf`, '_blank')
        }
      }
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <div className="space-y-8">
      {/* Formulaire émission */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Émettre un certificat</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Type de document</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {CERT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date d'expiration (optionnelle)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Étudiant</label>
          <input
            type="text"
            placeholder="Rechercher par nom ou matricule..."
            value={studentSearch}
            onChange={e => setStudentSearch(e.target.value)}
            className="mb-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          {loadingStudents ? (
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
          ) : (
            <select
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              size={5}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">— Sélectionner un étudiant —</option>
              {filteredStudents.map((s: any) => {
                const p = s.profiles
                return (
                  <option key={s.id} value={s.id}>
                    {p?.last_name} {p?.first_name} {s.matricola ? `— ${s.matricola}` : ''}
                  </option>
                )
              })}
            </select>
          )}
        </div>

        <button
          onClick={handleIssue}
          disabled={isPending || !studentId}
          className="mt-4 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Émission...' : '📄 Émettre et télécharger le PDF'}
        </button>
      </div>

      {/* Historique */}
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold mr-2">Certificats émis</h2>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Tous les types</option>
            {CERT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {loadingCerts ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}
          </div>
        ) : !certs || certs.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground text-sm">
            Aucun certificat émis.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                  <th className="px-4 py-3 text-left">Étudiant</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Émis le</th>
                  <th className="px-4 py-3 text-left">N° série</th>
                  <th className="px-4 py-3 text-left">PDF</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((cert: any) => {
                  const student = cert.students
                  const profile = student?.profiles
                  const typeLabel = CERT_TYPES.find(t => t.value === cert.type)?.label ?? cert.type

                  return (
                    <tr key={cert.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 text-sm">
                        <p className="font-medium">{profile?.last_name} {profile?.first_name}</p>
                        <p className="text-xs text-muted-foreground">{student?.matricola ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">{typeLabel}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {format(new Date(cert.issued_at), 'd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                        {cert.serial_number}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`${API}/api/certificates/${cert.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary underline hover:text-primary/80"
                        >
                          ⬇️ PDF
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
