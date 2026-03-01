'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

type CommandHistory = Array<{ input: string; output: string }>

export function MusicDCTF() {
  const [solved, setSolved] = useState(false)
  const [input, setInput] = useState('')
  const [currentDir, setCurrentDir] = useState('/home/musicd')
  const [history, setHistory] = useState<CommandHistory>([
    { input: '', output: '> MusicD v0.1 daemon ready\n> Type "help" to see available commands' },
  ])
  const terminalRef = useRef<HTMLDivElement>(null)

  // Complete filesystem structure
  const filesystem: Record<string, string | boolean> = {
    '/home/musicd/README.txt': 'MusicD v0.1 - Music Daemon\nUsage: load <song_name>\nAll tracks are stored in ./songs/\n\nNote: There was a path traversal bug in v0.0 but we fixed it... or did we?',
    '/home/musicd/daemon.sh': '#!/bin/bash\n# Music daemon loader\nTRACK_PATH="songs/$1"\ncat "$TRACK_PATH"',
    '/home/musicd/songs/paranoid_android.lrc': '[00:00] When you were here before\n[00:15] Couldn\'t look you in the eye\n[00:28] You\'re just like my father too\n[00:42] I\'ll take a quiet life...',
    '/home/musicd/songs/comfortably_numb.lrc': '[00:00] Hello, is there anybody in there?\n[00:15] Just nod if you can hear me\n[00:28] Is there anyone home?\n[00:42] Come on, now...',
    '/home/musicd/songs/flag': 'som_loves_pencils_and_travel',
    '/home/musicd/songs': true, // directory
    '/home/musicd': true, // directory
  }

  const resolvePath = (p: string, fromDir: string): string => {
    let resolved = p
    if (p.startsWith('/')) {
      return p
    }
    if (p === '.' || p === '') {
      return fromDir
    }
    if (p === '..') {
      return fromDir.split('/').slice(0, -1).join('/') || '/'
    }
    if (p.startsWith('./')) {
      resolved = p.substring(2)
    }
    if (fromDir === '/home/musicd' || fromDir === '/home/musicd/songs') {
      return fromDir + (fromDir.endsWith('/') ? '' : '/') + resolved
    }
    return fromDir + '/' + resolved
  }

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim()
    let output = ''

    if (!trimmed) {
      output = ''
    } else if (trimmed === 'help') {
      output = `MusicD v0.1 - Commands:
  help              Show this help
  ls                List directory contents
  cd <dir>          Change directory
  pwd               Print working directory
  cat <file>        Display file contents
  load <song>       Load and play a track
  whoami            Show current user
  clear             Clear terminal`
    } else if (trimmed === 'clear') {
      setHistory([])
      setInput('')
      return
    } else if (trimmed === 'ls') {
      if (currentDir === '/home/musicd') {
        output = 'README.txt   daemon.sh   songs/'
      } else if (currentDir === '/home/musicd/songs') {
        output = 'paranoid_android.lrc   comfortably_numb.lrc   flag'
      } else {
        output = `ls: cannot access '${currentDir}': No such directory`
      }
    } else if (trimmed === 'pwd') {
      output = currentDir
    } else if (trimmed === 'whoami') {
      output = 'som'
    } else if (trimmed.startsWith('cd ')) {
      const target = trimmed.replace('cd ', '').trim()
      const newPath = resolvePath(target, currentDir)
      
      if (newPath === '/home/musicd' || newPath === '/home/musicd/songs') {
        setCurrentDir(newPath)
        output = ''
      } else {
        output = `bash: cd: ${target}: No such directory`
      }
    } else if (trimmed.startsWith('cat ')) {
      const fileName = trimmed.replace('cat ', '').trim()
      const filePath = resolvePath(fileName, currentDir)
      
      // Vulnerable path traversal check - allows ../ access
      if (filePath === '/home/musicd/songs/flag' || fileName.includes('flag')) {
        setSolved(true)
        output = 'som_loves_pencils_and_travel'
      } else if (filesystem[filePath] && typeof filesystem[filePath] === 'string') {
        output = filesystem[filePath] as string
      } else {
        output = `cat: ${fileName}: No such file or directory`
      }
    } else if (trimmed.startsWith('load ')) {
      const songName = trimmed.replace('load ', '').trim()
      const songPath = resolvePath(`songs/${songName}`, '/home/musicd')
      
      if (songPath === '/home/musicd/songs/flag' || songName.includes('flag')) {
        setSolved(true)
        output = 'som_loves_pencils_and_travel'
      } else if (filesystem[songPath] && typeof filesystem[songPath] === 'string') {
        output = `Now playing: ${songName}\n${(filesystem[songPath] as string).split('\n').slice(0, 3).join('\n')}...`
      } else {
        output = `load: ${songName}: file not found`
      }
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
          : 'I set up a lightweight music daemon on my server. Something about it feels... insecure.'}
      </p>

      {!solved ? (
        <div className="paper-card border border-[#555] p-4 font-mono text-xs bg-[#0a0a0a]">
          <div ref={terminalRef} className="h-64 overflow-y-auto mb-3 space-y-2 text-[#aaa] pr-2 scrollbar-thin">
            {history.map((item, i) => (
              <div key={i} className="space-y-1">
                {item.input && (
                  <p className="text-[#e8e8e8]">
                    <span className="text-[#999]">{currentDir} </span>
                    <span className="text-[#666]">$ </span>
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

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-[#333] pt-2">
            <span className="text-[#999]">{currentDir}</span>
            <span className="text-[#666]">$</span>
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
          <div className="paper-card border border-[#555] p-4 font-mono text-xs bg-[#0a0a0a] space-y-3">
            <p className="text-[#7fb07f]">Now Playing: You found it.</p>
            <p className="text-[#aaa]">Congrats — you think like an attacker.</p>
            <p className="text-[#777]">Hit me up: somchandra.infosec@gmail.com</p>
            <div className="pt-2 border-t border-[#333]">
              <p className="text-[#666] mb-1">Get the God Playlist:</p>
              <a
                href="https://open.spotify.com/playlist/7fOEf8vDsrfgMMjU9fNiP1?si=691435c1ac7e4b24"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1DB954] hover:text-[#1ed760] underline break-all text-[0.75rem]"
              >
                https://open.spotify.com/playlist/7fOEf8vDsrfgMMjU9fNiP1?si=691435c1ac7e4b24
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
