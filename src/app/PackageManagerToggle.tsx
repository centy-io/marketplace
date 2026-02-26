'use client'

import { useSyncExternalStore } from 'react'

const PM_KEY = 'pkg-manager'
type PM = 'npm' | 'pnpm'

function subscribe(callback: () => void): () => void {
  window.addEventListener('pkg-manager-change', callback)
  return () => window.removeEventListener('pkg-manager-change', callback)
}

function getSnapshot(): PM {
  try {
    const stored = localStorage.getItem(PM_KEY)
    return stored === 'pnpm' ? 'pnpm' : 'npm'
  } catch {
    return 'npm'
  }
}

function getServerSnapshot(): PM {
  return 'npm'
}

export default function PackageManagerToggle() {
  const pm = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function select(val: PM) {
    try {
      localStorage.setItem(PM_KEY, val)
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('pkg-manager-change'))
  }

  return (
    <div className="pm-toggle-bar">
      <span className="pm-toggle-label">copy as</span>
      <div className="pm-toggle">
        <button
          className={`pm-btn${pm === 'npm' ? ' pm-btn-active' : ''}`}
          onClick={() => select('npm')}
          aria-pressed={pm === 'npm'}
        >
          npm
        </button>
        <button
          className={`pm-btn${pm === 'pnpm' ? ' pm-btn-active' : ''}`}
          onClick={() => select('pnpm')}
          aria-pressed={pm === 'pnpm'}
        >
          pnpm
        </button>
      </div>
    </div>
  )
}
