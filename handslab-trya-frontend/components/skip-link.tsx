"use client"

import * as React from "react"

type SkipLinkProps = {
  targetId?: string
  children?: React.ReactNode
}

export function SkipLink({ targetId = "conteudo-principal", children = "Pular para o conteúdo" }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:top-3 focus:left-3 focus:px-3 focus:py-2 focus:rounded-md focus:bg-emerald-600 focus:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
    >
      {children}
    </a>
  )
}
