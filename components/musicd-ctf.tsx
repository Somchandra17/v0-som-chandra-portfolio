'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

type CommandHistory = Array<{ input: string; output: string }>

export function MusicDCTF() {
  const [solved, setSolved] = useState(false)
  const [input, setInput] = useState('')
  const [currentDir, setCurrentDir] = useState('/home/musicd')
  const [history, setHistory] = useState<CommandHistory>([
    { input: '', output: '> MusicD v0.1 daemon ready\n> Type "help" to see available commands\n> hint: read the source code carefully...' },
  ])
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Visible filesystem -- flag is NOT here, it lives outside the music dir
  const filesystem: Record<string, string | boolean> = {
    '/home/musicd/README.txt': 'MusicD v0.1 - Music Daemon\nUsage: load <song_name>\nAll tracks are stored in ./songs/\n\nNote: We patched the path traversal bug from v0.0.\nSongs are sandboxed to /home/musicd/songs/ now.\n\n...or did we?',
    '/home/musicd/daemon.sh': '#!/bin/bash\n# MusicD v0.1 track loader\nBASE="/home/musicd/songs"\nTRACK_PATH="$BASE/$1"\n# TODO: sanitize input? nah, $1 only takes filenames right?\n# NOTE: flag moved to /flag.txt for safekeeping\ncat "$TRACK_PATH"',
    '/home/musicd/songs/paranoid_android.lrc': '[00:00] When you were here before\n[00:15] Couldn\'t look you in the eye\n[00:28] You\'re just like my father too\n[00:42] I\'ll take a quiet life...',
    '/home/musicd/songs/comfortably_numb.lrc': '[00:00] Hello, is there anybody in there?\n[00:15] Just nod if you can hear me\n[00:28] Is there anyone home?\n[00:42] Come on, now...',
    '/home/musicd/.bash_history': 'cat daemon.sh\nload paranoid_android.lrc\ncat /flag.txt\nload ../../flag.txt\nwhoami',
    '/home/musicd/songs': true,
    '/home/musicd': true,
    '/home': true,
    '/': true,
    // flag is at /flag.txt -- outside musicd's directory entirely
    '/flag.txt': 'som_loves_pencils_and_travel',
  }

  const resolvePath = (p: string, fromDir: string): string => {
    if (p.startsWith('/')) {
      // Normalize absolute path
      const parts = p.split('/').filter(Boolean)
      const resolved: string[] = []
      for (const part of parts) {
        if (part === '..') resolved.pop()
        else if (part !== '.') resolved.push(part)
      }
      return '/' + resolved.join('/')
    }
    
    // Relative path
    const baseParts = fromDir.split('/').filter(Boolean)
    const pathParts = p.split('/').filter(Boolean)
    
    for (const part of pathParts) {
      if (part === '..') baseParts.pop()
      else if (part !== '.') baseParts.push(part)
    }
    
    return '/' + baseParts.join('/')
  }

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase() === cmd.trim() ? cmd.trim() : cmd.trim()
    const lowerCmd = trimmed.toLowerCase()
    let output = ''

    // Add to command history
    if (trimmed) {
      setCmdHistory(prev => [...prev, trimmed])
      setHistoryIndex(-1)
    }

    if (!trimmed) {
      output = ''
    } else if (lowerCmd === 'help' || lowerCmd === 'h' || lowerCmd === '?') {
      output = `MusicD v0.1 - Commands:
  help              Show this help
  ls [path]         List directory contents
  cd <dir>          Change directory
  pwd               Print working directory
  cat <file>        Display file contents
  load <song>       Load and play a track
  whoami            Show current user
  id                Show user info
  echo <text>       Print text
  history           Show command history
  clear             Clear terminal
  
hint: something seems off about that daemon...`
    } else if (lowerCmd === 'clear' || lowerCmd === 'cls') {
      setHistory([])
      setInput('')
      return
    } else if (lowerCmd === 'history') {
      output = cmdHistory.map((c, i) => `  ${i + 1}  ${c}`).join('\n') || '(empty)'
    } else if (lowerCmd.startsWith('echo ')) {
      output = trimmed.substring(5)
    } else if (lowerCmd === 'echo') {
      output = ''
    } else if (lowerCmd === 'ls' || lowerCmd === 'ls .' || lowerCmd === 'ls ./') {
      if (currentDir === '/home/musicd') {
        output = 'README.txt   daemon.sh   songs/'
      } else if (currentDir === '/home/musicd/songs') {
        output = 'paranoid_android.lrc   comfortably_numb.lrc'
      } else if (currentDir === '/home') {
        output = 'musicd/'
      } else if (currentDir === '/') {
        output = 'home/   flag.txt'
      } else {
        output = `ls: cannot access '${currentDir}': No such directory`
      }
    } else if (lowerCmd === 'ls -la' || lowerCmd === 'ls -a' || lowerCmd === 'ls -al' || lowerCmd === 'ls -all' || lowerCmd === 'la') {
      if (currentDir === '/home/musicd') {
        output = `total 16
drwxr-xr-x 3 som som 4096 Jan 15 03:42 .
drwxr-xr-x 3 som som 4096 Jan 15 03:42 ..
-rw-r--r-- 1 som som  142 Jan 15 03:42 .bash_history
-rw-r--r-- 1 som som  256 Jan 15 03:42 README.txt
-rwxr-xr-x 1 som som  198 Jan 15 03:42 daemon.sh
drwxr-xr-x 2 som som 4096 Jan 15 03:42 songs/`
      } else if (currentDir === '/home/musicd/songs') {
        output = `total 8
drwxr-xr-x 2 som som 4096 Jan 15 03:42 .
drwxr-xr-x 3 som som 4096 Jan 15 03:42 ..
-rw-r--r-- 1 som som  156 Jan 15 03:42 paranoid_android.lrc
-rw-r--r-- 1 som som  142 Jan 15 03:42 comfortably_numb.lrc`
      } else if (currentDir === '/') {
        output = `total 12
drwxr-xr-x 3 root root 4096 Jan 15 03:42 .
drwxr-xr-x 3 root root 4096 Jan 15 03:42 ..
drwxr-xr-x 3 root root 4096 Jan 15 03:42 home/
-r-------- 1 root root   28 Jan 15 03:42 flag.txt`
      } else {
        output = `ls: cannot access '${currentDir}': No such directory`
      }
    } else if (lowerCmd.startsWith('ls ')) {
      const target = trimmed.substring(3).trim()
      const resolvedPath = resolvePath(target, currentDir)
      
      if (resolvedPath === '/home/musicd') {
        output = 'README.txt   daemon.sh   songs/'
      } else if (resolvedPath === '/home/musicd/songs') {
        output = 'paranoid_android.lrc   comfortably_numb.lrc'
      } else if (resolvedPath === '/' || resolvedPath === '') {
        output = 'home/   flag.txt'
      } else if (resolvedPath === '/home') {
        output = 'musicd/'
      } else {
        output = `ls: cannot access '${target}': No such file or directory`
      }
    } else if (lowerCmd === 'pwd') {
      output = currentDir
    } else if (lowerCmd === 'whoami') {
      output = 'som'
    } else if (lowerCmd === 'id') {
      output = 'uid=1000(som) gid=1000(som) groups=1000(som)'
    } else if (lowerCmd === 'uname' || lowerCmd === 'uname -a') {
      output = 'Linux musicd-server 5.15.0-generic #1 SMP x86_64 GNU/Linux'
    } else if (lowerCmd === 'date') {
      output = new Date().toString()
    } else if (lowerCmd === 'hostname') {
      output = 'musicd-server'
    } else if (lowerCmd === 'cd' || lowerCmd === 'cd ~' || lowerCmd === 'cd /home/musicd') {
      setCurrentDir('/home/musicd')
      output = ''
    } else if (lowerCmd === 'cd /' || trimmed === 'cd /') {
      setCurrentDir('/')
      output = ''
    } else if (lowerCmd === 'cd ..' || trimmed === 'cd..') {
      const parent = currentDir.split('/').slice(0, -1).join('/') || '/'
      if (parent === '/' || parent === '/home' || parent === '/home/musicd' || parent === '/home/musicd/songs') {
        setCurrentDir(parent)
        output = ''
      } else {
        output = `bash: cd: ..: Permission denied`
      }
    } else if (lowerCmd.startsWith('cd ')) {
      const target = trimmed.substring(3).trim()
      const newPath = resolvePath(target, currentDir)
      
      if (newPath === '/home/musicd' || newPath === '/home/musicd/songs' || newPath === '/' || newPath === '/home') {
        setCurrentDir(newPath)
        output = ''
      } else if (filesystem[newPath] === true) {
        setCurrentDir(newPath)
        output = ''
      } else {
        output = `bash: cd: ${target}: No such file or directory`
      }
    } else if (lowerCmd.startsWith('cat ')) {
      const fileName = trimmed.substring(4).trim()
      const filePath = resolvePath(fileName, currentDir)
      
      // cat is sandboxed - can't read /flag.txt directly
      if (filePath === '/flag.txt') {
        output = 'cat: /flag.txt: Permission denied\nhint: maybe there\'s another way to read files...'
      } else if (filesystem[filePath] && typeof filesystem[filePath] === 'string') {
        output = filesystem[filePath] as string
      } else if (filesystem[filePath] === true) {
        output = `cat: ${fileName}: Is a directory`
      } else {
        output = `cat: ${fileName}: No such file or directory`
      }
    } else if (lowerCmd === 'cat') {
      output = 'cat: missing operand'
    } else if (lowerCmd === 'load' || lowerCmd === 'load ') {
      output = 'load: missing track name\nusage: load <song_name>'
    } else if (lowerCmd.startsWith('load ')) {
      const songName = trimmed.substring(5).trim()
      
      if (!songName) {
        output = 'load: missing track name\nusage: load <song_name>'
      } else {
        // load prepends songs/ to the input then cats it (see daemon.sh)
        // This is the vulnerable command -- path traversal!
        const rawPath = 'songs/' + songName
        const parts = rawPath.split('/')
        const resolved: string[] = []
        for (const part of parts) {
          if (part === '..') resolved.pop()
          else if (part !== '.' && part !== '') resolved.push(part)
        }
        const finalPath = '/' + resolved.join('/')

        // Check if traversal reached /flag.txt
        if (finalPath === '/flag.txt' || finalPath === '/flag') {
          setSolved(true)
          output = `> loading track: ${songName}\n> reading from: /home/musicd/${rawPath}\n\nsom_loves_pencils_and_travel\n\n[!] wait... that's not a song.`
        } else {
          const fullPath = '/home/musicd/' + resolved.join('/')
          if (filesystem[fullPath] && typeof filesystem[fullPath] === 'string') {
            output = `Now playing: ${songName}\n${(filesystem[fullPath] as string).split('\n').slice(0, 3).join('\n')}...`
          } else {
            output = `load: ${songName}: track not found in songs/\nhint: try "load paranoid_android.lrc" or check what files exist`
          }
        }
      }
    } else if (trimmed === 'som_loves_pencils_and_travel') {
      setSolved(true)
      output = '> flag accepted. nice work.'
    } else if (lowerCmd === 'hint' || lowerCmd === 'hints') {
      output = `hints:
  1. read the daemon.sh file carefully
  2. notice how "load" builds the path
  3. what if you could escape the songs/ directory?
  4. look up "path traversal vulnerability"
  5. the flag is at /flag.txt`
    } else if (lowerCmd === 'flag' || lowerCmd === 'getflag' || lowerCmd === 'get flag') {
      output = 'nice try. find it yourself ;)'
    } else if (lowerCmd.startsWith('sudo ')) {
      output = `[sudo] password for som: 
som is not in the sudoers file. This incident will be reported.`
    } else if (lowerCmd === 'su' || lowerCmd === 'su root' || lowerCmd === 'su -') {
      output = 'su: Authentication failure'
    } else if (lowerCmd === 'exit' || lowerCmd === 'quit' || lowerCmd === 'logout') {
      output = 'logout\n\n...wait you can\'t leave, the CTF isn\'t solved yet!'
    } else if (lowerCmd === 'rm' || lowerCmd.startsWith('rm ')) {
      output = 'rm: permission denied (nice try tho)'
    } else if (lowerCmd === 'vim' || lowerCmd === 'nano' || lowerCmd === 'vi' || lowerCmd.startsWith('vim ') || lowerCmd.startsWith('nano ')) {
      output = 'error: no editor found (and honestly, who needs one?)'
    } else if (lowerCmd === 'man' || lowerCmd.startsWith('man ')) {
      output = 'man: no manual entry. figure it out yourself.'
    } else if (lowerCmd === 'touch' || lowerCmd.startsWith('touch ')) {
      output = 'touch: cannot create file: Read-only file system'
    } else if (lowerCmd === 'mkdir' || lowerCmd.startsWith('mkdir ')) {
      output = 'mkdir: cannot create directory: Read-only file system'
    } else if (lowerCmd === 'wget' || lowerCmd === 'curl' || lowerCmd.startsWith('wget ') || lowerCmd.startsWith('curl ')) {
      output = 'network: connection refused (no internet for you)'
    } else if (lowerCmd === 'ifconfig' || lowerCmd === 'ip a' || lowerCmd === 'ip addr') {
      output = 'lo: 127.0.0.1\neth0: 10.0.0.42'
    } else if (lowerCmd === 'ps' || lowerCmd === 'ps aux') {
      output = `USER    PID  CMD
som       1  /bin/bash
som      42  ./daemon.sh`
    } else if (lowerCmd === 'top' || lowerCmd === 'htop') {
      output = 'top: display too small (this is a tiny terminal)'
    } else if (lowerCmd.startsWith('grep ') || lowerCmd.startsWith('find ') || lowerCmd.startsWith('locate ')) {
      output = `${trimmed.split(' ')[0]}: command available but won't help you here`
    } else if (lowerCmd === 'neofetch' || lowerCmd === 'screenfetch') {
      output = `      _____
     /     \\     som@musicd-server
    |  O O  |    OS: MusicD Linux
    |   >   |    Shell: bash 5.1
     \\_____/     Terminal: web-term
                 CTF: unsolved`
    } else if (lowerCmd === 'cowsay' || lowerCmd.startsWith('cowsay ')) {
      output = ` ________
< solve the CTF >
 --------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`
    } else if (lowerCmd === 'sl') {
      output = '🚂💨 choo choo (you typed sl instead of ls)'
    } else {
      output = `bash: ${trimmed.split(' ')[0]}: command not found\ntype "help" for available commands`
    }

    setHistory(prev => [...prev, { input: trimmed, output }])
    setInput('')
  }

  // Handle arrow key navigation through command history
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (cmdHistory.length > 0) {
        const newIndex = historyIndex < cmdHistory.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setInput(cmdHistory[cmdHistory.length - 1 - newIndex] || '')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(cmdHistory[cmdHistory.length - 1 - newIndex] || '')
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput('')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Simple tab completion
      const parts = input.split(' ')
      const lastPart = parts[parts.length - 1]
      
      const completions = ['help', 'ls', 'cd', 'pwd', 'cat', 'load', 'whoami', 'clear', 'history', 'hint', 'echo', 'id']
      const fileCompletions = ['README.txt', 'daemon.sh', 'songs/', 'paranoid_android.lrc', 'comfortably_numb.lrc', '.bash_history']
      
      const allCompletions = parts.length === 1 ? completions : fileCompletions
      const match = allCompletions.find(c => c.toLowerCase().startsWith(lastPart.toLowerCase()))
      
      if (match) {
        parts[parts.length - 1] = match
        setInput(parts.join(' '))
      }
    }
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  // Focus input when clicking anywhere in terminal
  const handleTerminalClick = () => {
    inputRef.current?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCommand(input)
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
        <div 
          className="paper-card border border-[#555] p-4 font-mono text-xs bg-[#0a0a0a] cursor-text"
          onClick={handleTerminalClick}
        >
          {/* Terminal header */}
          <div className="flex items-center gap-2 pb-2 mb-2 border-b border-[#333]">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27ca41]" />
            </div>
            <span className="text-[#666] text-[0.7rem] ml-2">som@musicd-server: {currentDir}</span>
          </div>

          <div ref={terminalRef} className="h-64 overflow-y-auto mb-3 space-y-2 text-[#aaa] pr-2 scrollbar-thin">
            {history.map((item, i) => (
              <div key={i} className="space-y-1">
                {item.input && (
                  <p className="text-[#e8e8e8]">
                    <span className="text-[#7ec699]">som</span>
                    <span className="text-[#666]">@</span>
                    <span className="text-[#6cb6ff]">musicd</span>
                    <span className="text-[#666]">:</span>
                    <span className="text-[#c678dd]">{currentDir}</span>
                    <span className="text-[#e8e8e8]">$ </span>
                    {item.input}
                  </p>
                )}
                {item.output && (
                  <div className="whitespace-pre-wrap text-[#888] text-[0.8rem] leading-relaxed">
                    {item.output}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-0 border-t border-[#333] pt-2">
            <span className="text-[#7ec699]">som</span>
            <span className="text-[#666]">@</span>
            <span className="text-[#6cb6ff]">musicd</span>
            <span className="text-[#666]">:</span>
            <span className="text-[#c678dd]">{currentDir}</span>
            <span className="text-[#e8e8e8]">$&nbsp;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder=""
              className="bg-transparent text-[#e8e8e8] placeholder-[#555] outline-none flex-1 font-mono text-xs caret-[#e8e8e8]"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </form>
          <p className="text-[0.65rem] text-[#444] mt-2">tip: use arrow keys for history, tab for autocomplete</p>
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
