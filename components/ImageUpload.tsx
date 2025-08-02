'use client'

import { useState } from 'react'

interface ImageUploadProps {
  onChange: (dataUrl: string) => void
}

export function ImageUpload({ onChange }: ImageUploadProps) {
  const [value, setValue] = useState<any>()

  async function read(e: React.ChangeEvent<HTMLInputElement>) {
    setValue('')
    const file = e.target.files?.[0]
    if (!file)
      return

    const reader = new FileReader()
    const promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        resolve(reader.result as any)
      }
      reader.onerror = reject
    })
    reader.readAsDataURL(file)
    onChange(await promise)
  }

  return (
    <input
      type="file"
      accept="image/*"
      value={value}
      className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
      onChange={read}
    />
  )
}
