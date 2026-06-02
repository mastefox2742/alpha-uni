'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Step = 'check' | 'enroll' | 'verify' | 'done'

export function AdminMFASetup() {
  const [step, setStep]         = useState<Step>('check')
  const [qrCode, setQrCode]     = useState('')
  const [secret, setSecret]     = useState('')
  const [factorId, setFactorId] = useState('')
  const [code, setCode]         = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [factors, setFactors]   = useState<Array<{ id: string; status: string; factor_type: string }>>([])

  const supabase = createClient()

  useEffect(() => { checkMFA() }, [])

  async function checkMFA() {
    const { data } = await supabase.auth.mfa.listFactors()
    const verified = (data?.totp ?? []).filter(f => f.status === 'verified')
    setFactors(data?.totp ?? [])
    if (verified.length > 0) setStep('done')
    else setStep('enroll')
  }

  async function handleEnroll() {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'UniGest Admin' })
    if (err || !data) { setError(err?.message ?? 'Erreur'); setLoading(false); return }

    setFactorId(data.id)
    setSecret(data.totp.secret)
    if (data.totp.qr_code) setQrCode(data.totp.qr_code)
    setStep('verify')
    setLoading(false)
  }

  async function handleVerify() {
    if (code.length !== 6) { setError('Le code doit contenir 6 chiffres'); return }
    setLoading(true)
    setError('')

    const challengeRes = await supabase.auth.mfa.challenge({ factorId })
    if (challengeRes.error) { setError(challengeRes.error.message); setLoading(false); return }

    const verifyRes = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeRes.data.id,
      code,
    })
    if (verifyRes.error) { setError('Code invalide — réessayez'); setLoading(false); return }

    setStep('done')
    setLoading(false)
  }

  async function handleDisable(fId: string) {
    if (!confirm('Désactiver le MFA ? Votre compte sera moins sécurisé.')) return
    setLoading(true)
    await supabase.auth.mfa.unenroll({ factorId: fId })
    setLoading(false)
    checkMFA()
  }

  if (step === 'check') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-xl">✅</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">MFA activé</h3>
            <p className="text-xs text-muted-foreground">
              Votre compte admin est protégé par l'authentification à deux facteurs.
            </p>
          </div>
        </div>

        {factors.filter(f => f.status === 'verified').map(f => (
          <div key={f.id} className="flex items-center justify-between py-2 border-t">
            <div>
              <p className="text-sm font-medium">📱 Authenticator TOTP</p>
              <p className="text-xs text-muted-foreground">ID : {f.id.substring(0, 8)}…</p>
            </div>
            <button
              className="text-xs text-red-600 hover:underline"
              onClick={() => handleDisable(f.id)}
              disabled={loading}
            >
              Désactiver
            </button>
          </div>
        ))}
      </div>
    )
  }

  if (step === 'enroll') {
    return (
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-xl">⚠️</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">MFA non activé</h3>
            <p className="text-xs text-muted-foreground">
              Obligatoire pour les comptes admin. Activez l'authentification à deux facteurs pour protéger votre accès.
            </p>
          </div>
        </div>
        <button
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
          onClick={handleEnroll}
          disabled={loading}
        >
          {loading ? 'Génération du QR code…' : 'Activer le MFA →'}
        </button>
      </div>
    )
  }

  // step === 'verify'
  return (
    <div className="rounded-xl border bg-card p-6 space-y-6">
      <div>
        <h3 className="font-semibold">Scannez ce QR code</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Utilisez Google Authenticator, Authy, ou 1Password pour scanner le code.
        </p>
      </div>

      {/* QR Code */}
      {qrCode && (
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCode} alt="QR Code MFA" className="h-48 w-48 rounded-lg border" />
        </div>
      )}

      {/* Code secret en fallback */}
      <div className="rounded-lg bg-muted p-3">
        <p className="text-xs text-muted-foreground mb-1">Ou entrez ce code manuellement :</p>
        <p className="font-mono text-sm font-semibold tracking-widest text-center">{secret}</p>
      </div>

      {/* Saisie code */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          Code à 6 chiffres de votre application
        </label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <button
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
        onClick={handleVerify}
        disabled={loading || code.length !== 6}
      >
        {loading ? 'Vérification…' : 'Confirmer et activer le MFA'}
      </button>
    </div>
  )
}
