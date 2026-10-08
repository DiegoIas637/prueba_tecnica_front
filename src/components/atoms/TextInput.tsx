interface TextInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  mono?: boolean
  invalid?: boolean
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  mono,
  invalid,
}: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-xl border bg-white/70 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100 ${
        invalid ? 'border-rose-300' : 'border-violet-100'
      } ${mono ? 'font-mono' : ''}`}
    />
  )
}
