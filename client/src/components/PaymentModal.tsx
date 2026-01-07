import { useEffect, useMemo, useState } from 'react'
import { MaterialIcon } from './MaterialIcon'
import { useAuth } from '../state/AuthContext'

type Props = {
  open: boolean
  title?: string
  amountEur: number
  description?: string
  onCancel: () => void
  onSuccess: (paymentId: string) => void
}

type Step = 'form' | 'processing' | 'success' | 'failed'

type SavedCard = {
  id: string
  name: string
  number: string
  exp: string
  cvc: string
  last4: string
  savedAt: number
}

function getStorageKey(userId: number | null): string {
  if (!userId) return 'sporttown_saved_cards_guest'
  return `sporttown_saved_cards_user_${userId}`
}

function getSavedCards(userId: number | null): SavedCard[] {
  try {
    const key = getStorageKey(userId)
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveCardToStorage(card: Omit<SavedCard, 'id' | 'savedAt'>, userId: number | null): SavedCard {
  const saved: SavedCard = {
    ...card,
    id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    savedAt: Date.now(),
  }
  const cards = getSavedCards(userId)
  cards.push(saved)
  const key = getStorageKey(userId)
  localStorage.setItem(key, JSON.stringify(cards))
  return saved
}

function deleteCardFromStorage(cardId: string, userId: number | null): void {
  const cards = getSavedCards(userId)
  const filtered = cards.filter((c) => c.id !== cardId)
  const key = getStorageKey(userId)
  localStorage.setItem(key, JSON.stringify(filtered))
}


export function PaymentModal({ open, title = 'Pago seguro', amountEur, description, onCancel, onSuccess }: Props) {
  const auth = useAuth()
  const [step, setStep] = useState<Step>('form')
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [exp, setExp] = useState('')
  const [cvc, setCvc] = useState('')
  const [saveCard, setSaveCard] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [error, setError] = useState<string | null>(null)
  const busy = step === 'processing'
  
  const userId = auth.user?.id || null

  useEffect(() => {
    if (!open) {
      // Limpiar campos al cerrar
      setName('')
      setNumber('')
      setExp('')
      setCvc('')
      setSaveCard(false)
      setSelectedCardId(null)
      return
    }
    // Al abrir el modal, resetear todo
    setStep('form')
    setError(null)
    
    // Cargar tarjetas del usuario actual
    setSavedCards(getSavedCards(userId))
    setSelectedCardId(null)
    setName('')
    setNumber('')
    setExp('')
    setCvc('')
    setSaveCard(false)
  }, [open, userId])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  const normalized = useMemo(() => number.replace(/\s+/g, ''), [number])
  const last4 = useMemo(() => normalized.slice(-4), [normalized])
  
  const validation = useMemo(() => {
    const errors: string[] = []
    
    if (name.trim().length < 2) {
      errors.push('El nombre del titular debe tener al menos 2 caracteres')
    }
    
    if (!/^\d{16}$/.test(normalized)) {
      errors.push('La tarjeta debe tener exactamente 16 dígitos')
    }
    
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp.trim())) {
      errors.push('La fecha de expiración debe tener el formato MM/YY (ej: 12/27)')
    } else {
      // Validar que la fecha no esté vencida
      const [month, year] = exp.trim().split('/')
      const expDate = new Date(2000 + Number(year), Number(month) - 1)
      const now = new Date()
      if (expDate < now) {
        errors.push('La fecha de expiración está vencida')
      }
    }
    
    if (!/^\d{3,4}$/.test(cvc.trim())) {
      errors.push('El CVC debe tener 3 o 4 dígitos')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    }
  }, [name, normalized, exp, cvc])
  
  const isValid = validation.isValid

  function loadSavedCard(card: SavedCard) {
    setName(card.name)
    setNumber(card.number)
    setExp(card.exp)
    setCvc(card.cvc)
    setSelectedCardId(card.id)
    setSaveCard(false)
  }

  function clearSelectedCard() {
    setSelectedCardId(null)
    setName('')
    setNumber('')
    setExp('')
    setCvc('')
    setSaveCard(false)
  }

  async function simulatePay() {
    setError(null)
    setStep('processing')

    await sleep(450)
    await sleep(550)
    const ok = Math.random() > 0.08

    if (!ok) {
      setStep('failed')
      setError('Pago rechazado por el banco. Prueba otra tarjeta.')
      return
    }

    setStep('success')
    const paymentId = `pay_${Date.now()}_${Math.floor(Math.random() * 10000)}`
    
    // Guardar tarjeta si el usuario marcó la opción
    if (saveCard && isValid) {
      saveCardToStorage({
        name: name.trim(),
        number: formatCard(normalized),
        exp: exp.trim(),
        cvc: cvc.trim(),
        last4,
      }, userId)
      setSavedCards(getSavedCards(userId))
    }
    
    await sleep(350)
    onSuccess(paymentId)
  }

  if (!open) return null

  return (
    <div className="modalOverlay" role="presentation" onMouseDown={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Pago" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <div className="modalTitle">{title}</div>
            {description ? <div className="modalSub">{description}</div> : null}
          </div>
          <button className="iconBtn" type="button" onClick={onCancel} aria-label="Cerrar">
            <MaterialIcon name="close" />
          </button>
        </div>

        <div className="modalBody">
          <div className="paySummary">
            <div className="payLine">
              <span>Total</span>
              <strong>{amountEur.toFixed(2)}€</strong>
            </div>
            <div className="payHint">usa cualquier tarjeta de 16 dígitos, MM/YY y CVC.</div>
          </div>

          {error ? <div className="alert alertError">{error}</div> : null}
          
          {validation.errors.length > 0 && step === 'form' ? (
            <div className="alert alertError">
              <div style={{ fontWeight: 800, marginBottom: '6px' }}>Errores de validación:</div>
              <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc' }}>
                {validation.errors.map((err, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>{err}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {savedCards.length > 0 && step === 'form' && !selectedCardId ? (
            <div className="field">
              <label className="label">Tarjeta guardada</label>
              <div className="savedCardsList">
                {savedCards.map((card) => (
                  <div key={card.id} className="savedCardItem">
                    <button
                      type="button"
                      className="savedCardBtn"
                      onClick={() => loadSavedCard(card)}
                      disabled={busy}
                    >
                      <div className="savedCardInfo">
                        <span className="savedCardName">{card.name}</span>
                        <span className="savedCardNumber">•••• {card.last4}</span>
                      </div>
                      <span className="savedCardExp">{card.exp}</span>
                    </button>
                    <button
                      type="button"
                      className="savedCardDelete"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`¿Eliminar la tarjeta terminada en ${card.last4}?`)) {
                          deleteCardFromStorage(card.id, userId)
                          setSavedCards(getSavedCards(userId))
                          if (selectedCardId === card.id) {
                            clearSelectedCard()
                          }
                        }
                      }}
                      disabled={busy}
                      aria-label={`Eliminar tarjeta terminada en ${card.last4}`}
                    >
                      <MaterialIcon name="close" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {selectedCardId && step === 'form' ? (
            <div className="alert" style={{ background: 'rgba(178, 102, 255, 0.1)', borderColor: 'rgba(178, 102, 255, 0.3)', marginBottom: '12px' }}>
              Usando tarjeta guardada: •••• {savedCards.find(c => c.id === selectedCardId)?.last4}
            </div>
          ) : null}

          {step === 'processing' ? (
            <div className="payProcessing">
              <div className="spinner" aria-hidden="true" />
              <div>
                <div className="payProcessingTitle">Procesando pago…</div>
                <div className="muted">Verificando tarjeta • Autorizando • Confirmando</div>
              </div>
              <div className="progress">
                <div className="progressBar" />
              </div>
            </div>
          ) : null}

          {step === 'success' ? (
            <div className="alert alertOk">
              Pago aprobado. Tarjeta terminada en <strong>{last4 || '••••'}</strong>.
            </div>
          ) : null}

          {step === 'form' || step === 'failed' ? (
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault()
                void simulatePay()
              }}
            >
              <div className="field">
                <label className="label" htmlFor="cardName">
                  Titular
                </label>
                <input
                  id="cardName"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre y apellidos"
                  autoComplete="cc-name"
                  required
                  disabled={busy}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="cardNumber">
                  Tarjeta
                </label>
                <input
                  id="cardNumber"
                  className="input"
                  inputMode="numeric"
                  value={number}
                  onChange={(e) => setNumber(formatCard(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  autoComplete="cc-number"
                  required
                  disabled={busy}
                />
              </div>

              <div className="fieldRow">
                <div className="field">
                  <label className="label" htmlFor="exp">
                    Expira
                  </label>
                  <input
                    id="exp"
                    className="input"
                    value={exp}
                    onChange={(e) => setExp(formatExp(e.target.value))}
                    placeholder="MM/YY"
                    autoComplete="cc-exp"
                    required
                    disabled={busy}
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="cvc">
                    CVC
                  </label>
                  <input
                    id="cvc"
                    className="input"
                    inputMode="numeric"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                    placeholder="123"
                    autoComplete="cc-csc"
                    required
                    disabled={busy}
                  />
                </div>
              </div>

              {selectedCardId ? (
                <div className="field">
                  <button
                    type="button"
                    className="btn btnGhost btnSmall"
                    onClick={clearSelectedCard}
                    disabled={busy}
                  >
                    Cambiar tarjeta
                  </button>
                </div>
              ) : (
                <div className="field">
                  <label className="checkboxLabel">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      disabled={busy}
                    />
                    <span>Guardar datos para futuras compras</span>
                  </label>
                </div>
              )}

              <div className="modalActions">
                <button className="btn btnGhost" type="button" onClick={onCancel} disabled={busy}>
                  Cancelar
                </button>
                <button className="btn btnPrimary" type="submit" disabled={!isValid || busy}>
                  Pagar {amountEur.toFixed(2)}€
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function formatCard(raw: string) {
  const digits = raw.replace(/[^\d]/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExp(raw: string) {
  const digits = raw.replace(/[^\d]/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}


