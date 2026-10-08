import { describe, expect, it } from 'vitest'
import {
  formatCOP,
  formatDate,
  generateReference,
  isValidEmail,
} from './format'

describe('formatCOP', () => {
  it('formatea en pesos colombianos sin decimales', () => {
    const out = formatCOP(50000)
    expect(out).toContain('50.000')
    expect(out).not.toContain(',00')
  })
})

describe('formatDate', () => {
  it('formatea una fecha ISO válida', () => {
    expect(formatDate('2026-10-08T21:30:00+00:00')).not.toBe(
      '2026-10-08T21:30:00+00:00',
    )
  })

  it('devuelve el valor original si la fecha es inválida', () => {
    expect(formatDate('no-es-fecha')).toBe('no-es-fecha')
  })
})

describe('isValidEmail', () => {
  it.each([
    ['juan@ejemplo.test', true],
    ['a@b.co', true],
    ['sin-arroba.test', false],
    ['sin@dominio', false],
    ['', false],
    ['  espacios @x.com', false],
  ])('%s -> %s', (email, expected) => {
    expect(isValidEmail(email)).toBe(expected)
  })
})

describe('generateReference — formato documentado por asesor', () => {
  it('incluye el prefijo REF, el asesor y es único entre llamadas', () => {
    const a = generateReference('A')
    const b = generateReference('A')

    expect(a).toMatch(/^REF-A-\d{8}-[A-Z0-9]{4}$/)
    expect(a).not.toBe(b) // compra nueva => referencia nueva (R5)
  })

  it('refleja el asesor en el texto (A y B pueden coexistir)', () => {
    expect(generateReference('B')).toMatch(/^REF-B-/)
  })
})
