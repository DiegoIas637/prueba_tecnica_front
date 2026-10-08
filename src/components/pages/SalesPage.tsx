import { AdvisorSwitch } from '../organisms/AdvisorSwitch'
import { Logo } from '../organisms/Logo'
import { PlansPanel } from '../organisms/PlansPanel'
import { SaleForm } from '../organisms/SaleForm'
import { SalesTable } from '../organisms/SalesTable'
import { AppLayout } from '../templates/AppLayout'

/**
 * Page: ensambla organismos dentro del template para la pantalla principal
 * de registro y consulta de ventas.
 */
export function SalesPage() {
  return (
    <AppLayout
      header={
        <>
          <Logo />
          <AdvisorSwitch />
        </>
      }
      primary={
        <>
          <PlansPanel />
          <SalesTable />
        </>
      }
      aside={<SaleForm />}
      footer={
        <>
          Prototipo local · identidad de asesor simulada vía header{' '}
          <code className="font-mono text-brand-500">X-Advisor-Id</code>
        </>
      }
    />
  )
}
