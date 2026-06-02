import { Router } from 'express'
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/rbac.middleware'
import { auditLog } from '../middleware/mfa.middleware'
import { documentLimiter } from '../middleware/rateLimiter'
import {
  exportUserData,
  exportUserDataAsCsv,
  deleteUserData,
  rectifyUserData,
} from '../services/gdpr.service'

export const gdprRouter = Router()

/**
 * GET /api/gdpr/export
 * Droit d'accès — l'étudiant exporte ses données (Article 15 RGPD)
 * Rate limité : 5 req/min (évite l'abus)
 */
gdprRouter.get('/export',
  authMiddleware,
  documentLimiter,
  auditLog('GDPR_EXPORT_JSON'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const data = await exportUserData(req.user!.id)
      return res.json({ data })
    } catch (err) {
      return res.status(500).json({ error: 'Erreur export RGPD' })
    }
  },
)

/**
 * GET /api/gdpr/export/csv
 * Portabilité — export CSV (Article 20 RGPD)
 */
gdprRouter.get('/export/csv',
  authMiddleware,
  documentLimiter,
  auditLog('GDPR_EXPORT_CSV'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const csv = await exportUserDataAsCsv(req.user!.id)
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', 'attachment; filename="mes-donnees-unigest.csv"')
      return res.send('﻿' + csv)
    } catch (err) {
      return res.status(500).json({ error: 'Erreur export CSV' })
    }
  },
)

/**
 * DELETE /api/gdpr/me
 * Droit à l'effacement — l'étudiant supprime son compte (Article 17 RGPD)
 */
gdprRouter.delete('/me',
  authMiddleware,
  auditLog('GDPR_DELETE_SELF'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const result = await deleteUserData(req.user!.id, req.user!.id)
      return res.json({ data: result })
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message })
    }
  },
)

/**
 * DELETE /api/gdpr/users/:userId
 * Admin : supprime les données d'un utilisateur spécifique
 */
gdprRouter.delete('/users/:userId',
  authMiddleware,
  requireRole('admin'),
  auditLog('GDPR_DELETE_BY_ADMIN'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const result = await deleteUserData(req.params.userId!, req.user!.id)
      return res.json({ data: result })
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message })
    }
  },
)

/**
 * PATCH /api/gdpr/rectify
 * Droit de rectification — mettre à jour ses données (Article 16 RGPD)
 */
gdprRouter.patch('/rectify',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { firstName, lastName, phone } = req.body as {
        firstName?: string; lastName?: string; phone?: string
      }
      const rectifyInput: Parameters<typeof rectifyUserData>[1] = {}
      if (firstName) rectifyInput.firstName = firstName
      if (lastName)  rectifyInput.lastName  = lastName
      if (phone)     rectifyInput.phone     = phone
      await rectifyUserData(req.user!.id, rectifyInput)
      return res.json({ data: { message: 'Données mises à jour' } })
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message })
    }
  },
)
