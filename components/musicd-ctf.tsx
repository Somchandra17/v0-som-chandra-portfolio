'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

type CommandHistory = Array<{ input: string; output: string }>

export function MusicDCTF() {
  const [solved, setSolved] = useState(false)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<CommandHistory>([
    { input: '', output: '> MusicD v0.1 is running...\n> Type "musicd help" to get started' },
  ])
  const terminalRef = useRef<HTMLDivElement>(null)

  // Frontend filesystem - hidden from easy view
  const filesystem = {
    'songs/paranoid_android.lrc': '[00:01] Rain down, rain down...\n[00:05] Fitter, happier...',
    'songs/comfortably_numb.lrc': '[00:01] Hello? Is there anybody in there?\n[00:10] I can ease your pain...',
    'songs/now_playing.log': 'Last played: comfortably_numb @ 03:42',
    'README.txt': 'MusicD v0.1 - by Som\nUsage: musicd load <trackname>\nNote: tracks must be in the songs/ directory.\nTODO: fix the file loader, it\'s reading from\n      wherever you tell it lol',
    'daemon.sh': '#!/bin/bash\n# load track for playback\nTRACK_PATH="songs/$1"\ncat "$TRACK_PATH"   # ← no sanitization lmaooo',
    'flag.txt': 'flag{tr4v3rs1ng_thr0ugh_th3_b34t5}',
  } as Record<string, string>

  const resolvePath = (p: string): string | null => {
    // Path traversal check - intentionally vulnerable
    let resolved = p.replace(/^songs\//, '')
    
    // Remove leading ../ sequences to allow traversal
    while (resolved.startsWith('../')) {
      resolved = resolved.substring(3)
    }
    
    // Check if accessing flag.txt
    if (resolved === 'flag.txt' || resolved === 'flag' || p.includes('flag')) {
      return 'flag.txt'
    }
    
    // Otherwise prefix with songs/
    const fullPath = 'songs/' + resolved
    return filesystem[fullPath] ? fullPath : null
  }

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim()
    let output = ''

    if (trimmed === 'musicd help') {
      output = 'MusicD v0.1\nCommands:\n  musicd help\n  musicd list\n  musicd play <song>\n  musicd load <song>  (THE VULNERABLE ONE)'
    } else if (trimmed === 'musicd list') {
      output = 'Available tracks:\n  - paranoid_android.lrc\n  - comfortably_numb.lrc'
    } else if (trimmed.startsWith('musicd load ')) {
      const trackName = trimmed.replace('musicd load ', '')
      
      // Vulnerable: doesn't sanitize path
      const resolved = resolvePath('songs/' + trackName)
      
      if (resolved === 'flag.txt') {
        setSolved(true)
        output = '🎵 Now Playing: You found it.\nCongrats — you think like an attacker.\nHit me up: somchandra.infosec@gmail.com'
      } else if (resolved) {
        output = filesystem[resolved] || 'musicd: file read error'
      } else {
        output = `musicd: cannot load '${trackName}': No such file`
      }
    } else if (trimmed === 'ls') {
      output = 'songs/  daemon.sh  README.txt'
    } else if (trimmed === 'cat README.txt' || trimmed === 'cat README') {
      output = filesystem['README.txt']
    } else if (trimmed === 'cat daemon.sh' || trimmed === 'cat daemon') {
      output = filesystem['daemon.sh']
    } else if (trimmed === 'pwd') {
      output = '/home/musicd'
    } else if (trimmed === 'whoami') {
      output = 'som'
    } else if (trimmed === '') {
      output = ''
    } else {
      output = `bash: ${trimmed}: command not found`
    }

    setHistory([...history, { input: trimmed, output }])
    setInput('')
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      handleCommand(input)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[#ccc]">{'▌'}</span>
        <p className="font-mono text-xs tracking-widest uppercase text-[#ccc]">
          {solved ? 'god playlist unlocked' : 'musicd v0.1'}
        </p>
      </div>
      <p className="text-sm text-[#888] mb-6">
        {solved
          ? 'way too nerd to listen to this playlist lol'
          : 'I set up a lightweight music daemon on my server to stream my playlist. Something feels off though...'}
      </p>

      {!solved ? (
        <div className="paper-card border border-[#555] p-4 font-mono text-xs bg-[#0a0a0a]">
          <div ref={terminalRef} className="h-64 overflow-y-auto mb-3 space-y-2 text-[#aaa] pr-2 scrollbar-thin">
            {history.map((item, i) => (
              <div key={i} className="space-y-1">
                {item.input && (
                  <p className="text-[#e8e8e8]">
                    <span className="text-[#666]">{'> '}</span>
                    {item.input}
                  </p>
                )}
                {item.output && (
                  <div className="whitespace-pre-wrap text-[#888] text-[0.8rem]">
                    {item.output}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-1 border-t border-[#333] pt-2">
            <span className="text-[#666]">{'> '}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type command..."
              className="bg-[#0a0a0a] text-[#e8e8e8] placeholder-[#555] outline-none flex-1 font-mono text-xs"
              autoFocus
            />
          </form>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="paper-card border border-[#555] p-4 font-mono text-xs bg-[#0a0a0a]">
            <p className="text-[#7fb07f]">{'🎵 Now Playing: You found it.'}</p>
            <p className="text-[#aaa] mt-2">
              {'Congrats — you think like an attacker.'}
            </p>
            <p className="text-[#777] mt-2">
              {'Hit me up: somchandra.infosec@gmail.com'}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
