import { LogoMark } from '../atoms/LogoMark'

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-11 place-items-center rounded-2xl bg-white shadow-sm shadow-violet-200/60 ring-1 ring-violet-100">
        <LogoMark className="size-7" />
      </span>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800">
          Segura<span className="text-violet-500">Vida</span>
        </h1>
        <p className="text-sm text-slate-500">
          Registro de ventas · cupos limitados
        </p>
      </div>
    </div>
  )
}
