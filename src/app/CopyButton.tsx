'use client'

import { useState, useCallback, useSyncExternalStore } from 'react'
import {
  getCommand,
  subscribe,
  getSnapshot,
  getServerSnapshot,
} from './copy-utils'

export default function CopyButton({ pkgName }: { pkgName: string }) {
  const [copied, setCopied] = useState(false)
  const pm = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const handleCopy = useCallback(async () => {
    const command = getCommand(pkgName, pm)
    let didCopy = false

    try {
      await navigator.clipboard.writeText(command)
      didCopy = true
    } catch {
      try {
        const el = document.createElement('textarea')
        el.value = command
        el.style.cssText = 'position:absolute;left:-9999px;top:-9999px'
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        didCopy = true
      } catch {
        // clipboard unavailable — silent failure
      }
    }

    if (!didCopy) return
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [pkgName, pm])

  return (
    <button
      onClick={handleCopy}
      className={`copy-btn${copied ? ' copy-btn-success' : ''}`}
      aria-label={`Copy: ${getCommand(pkgName, pm)}`}
      title={getCommand(pkgName, pm)}
    >
      {copied ? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 8l5 5 7-8" />
        </svg>
      ) : (
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="4" width="10" height="10" rx="1" />
          <path d="M2 2h8a1 1 0 0 1 1 1v2H2V2z" />
        </svg>
      )}
    </button>
  )
}
