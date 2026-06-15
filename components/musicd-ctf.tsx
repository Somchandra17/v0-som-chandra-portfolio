"use client"

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react"
import { motion } from "framer-motion"
import { ArrowRight, CircleHelp, RefreshCw, TerminalSquare } from "lucide-react"

type OutputTone = "default" | "guide" | "hint" | "success" | "warning" | "error"
type CommandHistoryItem = {
  input: string
  output: string
  cwd: string
  tone?: OutputTone
}
type CommandHistory = CommandHistoryItem[]

const HOME_DIR = "/home/musicd"
const PLAYLIST_URL = "https://open.spotify.com/playlist/7fOEf8vDsrfgMMjU9fNiP1?si=691435c1ac7e4b24"

const STARTER_ACTIONS = [
  { label: "help", command: "help", note: "see the available commands" },
  { label: "list files", command: "ls", note: "inspect the room first" },
  { label: "read brief", command: "cat README.txt", note: "get the setup" },
  { label: "inspect daemon", command: "cat daemon.sh", note: "find the sketchy bit" },
  { label: "nudge me", command: "hint", note: "progressive hint system" },
] as const

const HINT_STEPS = [
  `hint 1/5
You do not need to be "good at terminals" for this.
Treat it like a tiny investigation: list files, read them, then focus on anything that handles user input.`,
  `hint 2/5
The important files are:
  - README.txt
  - daemon.sh

One explains the setup.
The other shows how the music loader builds the path it reads from.`,
  `hint 3/5
The suspicious command is not "cat". It is "load".
Compare what "load" reads with where the flag lives.`,
  `hint 4/5
In daemon.sh, user input gets appended after "songs/".
If user input contains "../", it may walk back out of that folder.`,
  `hint 5/5
Try escaping the songs directory directly:
  load ../../flag.txt`,
] as const

function getBootOutput() {
  return `> MusicD v0.1 daemon ready
> This is a tiny terminal puzzle. No terminal background required.
> Goal: figure out why the daemon feels insecure and unlock the playlist.
> Start with "help" or click one of the starter actions below.`
}

function getClearedOutput(cwd: string) {
  return `> screen cleared
> cwd: ${cwd}
> type "help", "guide", or "hint" if you want a softer landing`
}

function getGuideOutput() {
  return `beginner walkthrough:
  1. ls
  2. cat README.txt
  3. cat daemon.sh
  4. ls songs/
  5. load paranoid_android.lrc
  6. if you stall, type hint again

what you are looking for:
  - a command that builds a file path from user input
  - a way to escape the songs/ directory

You can click the starter buttons if you do not want to type everything.`
}

function getHelpOutput() {
  return `MusicD v0.1 - Commands:
  help              Show this help
  guide             Show a beginner-friendly walkthrough
  hint              Reveal the next hint
  hint <1-5>        Jump to a specific hint level
  ls [path]         List directory contents
  cd <dir>          Change directory
  pwd               Print working directory
  cat <file>        Display file contents
  load <song>       Load and play a track
  whoami            Show current user
  id                Show user info
  echo <text>       Print text
  history           Show command history
  clear             Clear the terminal view
  reset             Reset the challenge

good first moves:
  ls
  cat README.txt
  cat daemon.sh`
}

function buildPromptPath(cwd: string) {
  return cwd || HOME_DIR
}

function createInitialHistory(cwd = HOME_DIR): CommandHistory {
  return [{ input: "", output: getBootOutput(), cwd, tone: "guide" }]
}

function getToneClass(tone: OutputTone = "default") {
  switch (tone) {
    case "guide":
      return "text-ink-200"
    case "hint":
      return "text-[#d7c38a]"
    case "success":
      return "text-world"
    case "warning":
      return "text-[#c7a07e]"
    case "error":
      return "text-[#d08a8a]"
    default:
      return "text-ink-300"
  }
}

function TerminalPrompt({ cwd }: { cwd: string }) {
  return (
    <>
      <span className="text-world">som</span>
      <span className="text-ink-500">@</span>
      <span className="text-world">musicd</span>
      <span className="text-ink-500">:</span>
      <span className="text-ink-300">{buildPromptPath(cwd)}</span>
      <span className="text-ink-100">$ </span>
    </>
  )
}

export function MusicDCTF() {
  const [solved, setSolved] = useState(false)
  const [input, setInput] = useState("")
  const [currentDir, setCurrentDir] = useState(HOME_DIR)
  const [history, setHistory] = useState<CommandHistory>(() => createInitialHistory())
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [hintLevel, setHintLevel] = useState(0)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filesystem: Record<string, string | boolean> = {
    "/home/musicd/README.txt":
      "MusicD v0.1 - Music Daemon\nUsage: load <song_name>\nAll tracks are stored in ./songs/\n\nNote: We patched the path traversal bug from v0.0.\nSongs are sandboxed to /home/musicd/songs/ now.\n\n...or did we?",
    "/home/musicd/daemon.sh":
      "#!/bin/bash\n# MusicD v0.1 track loader\nBASE=\"/home/musicd/songs\"\nTRACK_PATH=\"$BASE/$1\"\n# TODO: sanitize input? nah, $1 only takes filenames right?\n# NOTE: flag moved to /flag.txt for safekeeping\ncat \"$TRACK_PATH\"",
    "/home/musicd/songs/paranoid_android.lrc":
      "[00:00] When you were here before\n[00:15] Couldn't look you in the eye\n[00:28] You're just like my father too\n[00:42] I'll take a quiet life...",
    "/home/musicd/songs/comfortably_numb.lrc":
      "[00:00] Hello, is there anybody in there?\n[00:15] Just nod if you can hear me\n[00:28] Is there anyone home?\n[00:42] Come on, now...",
    "/home/musicd/.bash_history":
      "cat daemon.sh\nload paranoid_android.lrc\ncat /flag.txt\nload ../../flag.txt\nwhoami",
    "/home/musicd/songs": true,
    "/home/musicd": true,
    "/home": true,
    "/": true,
    "/flag.txt": "som_loves_pencils_and_travel",
  }

  const resolvePath = (path: string, fromDir: string) => {
    if (path.startsWith("/")) {
      const parts = path.split("/").filter(Boolean)
      const resolved: string[] = []
      for (const part of parts) {
        if (part === "..") resolved.pop()
        else if (part !== ".") resolved.push(part)
      }
      return `/${resolved.join("/")}`
    }

    const baseParts = fromDir.split("/").filter(Boolean)
    const pathParts = path.split("/").filter(Boolean)

    for (const part of pathParts) {
      if (part === "..") baseParts.pop()
      else if (part !== ".") baseParts.push(part)
    }

    return `/${baseParts.join("/")}`
  }

  const resetTerminal = () => {
    setSolved(false)
    setInput("")
    setCurrentDir(HOME_DIR)
    setHistory(createInitialHistory())
    setCmdHistory([])
    setHistoryIndex(-1)
    setHintLevel(0)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  const pushHistoryItem = (item: CommandHistoryItem) => {
    setHistory((prev) => [...prev, item])
  }

  const revealHint = (requestedLevel?: number) => {
    const safeLevel = typeof requestedLevel === "number"
      ? Math.min(Math.max(requestedLevel, 1), HINT_STEPS.length)
      : Math.min(hintLevel + 1, HINT_STEPS.length)

    setHintLevel(safeLevel)

    return {
      output: HINT_STEPS[safeLevel - 1],
      tone: "hint" as const,
    }
  }

  const executeCommand = (rawCommand: string) => {
    const trimmed = rawCommand.trim()
    const lowerCmd = trimmed.toLowerCase()
    const commandCwd = currentDir
    let output = ""
    let tone: OutputTone = "default"

    if (trimmed) {
      setCmdHistory((prev) => [...prev, trimmed])
      setHistoryIndex(-1)
    }

    if (!trimmed) {
      setInput("")
      return
    }

    if (lowerCmd === "help" || lowerCmd === "h" || lowerCmd === "?") {
      output = getHelpOutput()
      tone = "guide"
    } else if (lowerCmd === "guide" || lowerCmd === "walkthrough" || lowerCmd === "starter") {
      output = getGuideOutput()
      tone = "guide"
    } else if (lowerCmd === "clear" || lowerCmd === "cls") {
      setHistory([{ input: "", output: getClearedOutput(commandCwd), cwd: commandCwd, tone: "guide" }])
      setInput("")
      return
    } else if (lowerCmd === "reset" || lowerCmd === "restart" || lowerCmd === "reboot") {
      resetTerminal()
      return
    } else if (lowerCmd === "history") {
      output = cmdHistory.map((command, index) => `  ${index + 1}  ${command}`).join("\n") || "(empty)"
    } else if (lowerCmd.startsWith("echo ")) {
      output = trimmed.slice(5)
    } else if (lowerCmd === "echo") {
      output = ""
    } else if (lowerCmd === "hint") {
      const hint = revealHint()
      output = hint.output
      tone = hint.tone
    } else if (lowerCmd === "hints") {
      output = `hint system:
  hint        reveal the next nudge
  hint <1-5>  jump to a specific hint level
  guide       show the beginner walkthrough

current hint strength: ${hintLevel}/5`
      tone = "guide"
    } else if (lowerCmd.startsWith("hint ")) {
      const requestedLevel = Number.parseInt(trimmed.slice(5).trim(), 10)
      if (Number.isNaN(requestedLevel)) {
        output = 'usage: hint <1-5>'
        tone = "error"
      } else {
        const hint = revealHint(requestedLevel)
        output = hint.output
        tone = hint.tone
      }
    } else if (lowerCmd === "ls" || lowerCmd === "ls ." || lowerCmd === "ls ./") {
      if (currentDir === "/home/musicd") {
        output = "README.txt   daemon.sh   songs/"
      } else if (currentDir === "/home/musicd/songs") {
        output = "paranoid_android.lrc   comfortably_numb.lrc"
      } else if (currentDir === "/home") {
        output = "musicd/"
      } else if (currentDir === "/") {
        output = "home/   flag.txt"
      } else {
        output = `ls: cannot access '${currentDir}': No such directory`
        tone = "error"
      }
    } else if (
      lowerCmd === "ls -la" ||
      lowerCmd === "ls -a" ||
      lowerCmd === "ls -al" ||
      lowerCmd === "ls -all" ||
      lowerCmd === "la"
    ) {
      if (currentDir === "/home/musicd") {
        output = `total 16
drwxr-xr-x 3 som som 4096 Jan 15 03:42 .
drwxr-xr-x 3 som som 4096 Jan 15 03:42 ..
-rw-r--r-- 1 som som  142 Jan 15 03:42 .bash_history
-rw-r--r-- 1 som som  256 Jan 15 03:42 README.txt
-rwxr-xr-x 1 som som  198 Jan 15 03:42 daemon.sh
drwxr-xr-x 2 som som 4096 Jan 15 03:42 songs/`
      } else if (currentDir === "/home/musicd/songs") {
        output = `total 8
drwxr-xr-x 2 som som 4096 Jan 15 03:42 .
drwxr-xr-x 3 som som 4096 Jan 15 03:42 ..
-rw-r--r-- 1 som som  156 Jan 15 03:42 paranoid_android.lrc
-rw-r--r-- 1 som som  142 Jan 15 03:42 comfortably_numb.lrc`
      } else if (currentDir === "/") {
        output = `total 12
drwxr-xr-x 3 root root 4096 Jan 15 03:42 .
drwxr-xr-x 3 root root 4096 Jan 15 03:42 ..
drwxr-xr-x 3 root root 4096 Jan 15 03:42 home/
-r-------- 1 root root   28 Jan 15 03:42 flag.txt`
      } else {
        output = `ls: cannot access '${currentDir}': No such directory`
        tone = "error"
      }
    } else if (lowerCmd.startsWith("ls ")) {
      const target = trimmed.slice(3).trim()
      const resolvedPath = resolvePath(target, currentDir)

      if (resolvedPath === "/home/musicd") {
        output = "README.txt   daemon.sh   songs/"
      } else if (resolvedPath === "/home/musicd/songs") {
        output = "paranoid_android.lrc   comfortably_numb.lrc"
      } else if (resolvedPath === "/" || resolvedPath === "") {
        output = "home/   flag.txt"
      } else if (resolvedPath === "/home") {
        output = "musicd/"
      } else {
        output = `ls: cannot access '${target}': No such file or directory`
        tone = "error"
      }
    } else if (lowerCmd === "pwd") {
      output = currentDir
    } else if (lowerCmd === "whoami") {
      output = "som"
    } else if (lowerCmd === "id") {
      output = "uid=1000(som) gid=1000(som) groups=1000(som)"
    } else if (lowerCmd === "uname" || lowerCmd === "uname -a") {
      output = "Linux musicd-server 5.15.0-generic #1 SMP x86_64 GNU/Linux"
    } else if (lowerCmd === "date") {
      output = new Date().toString()
    } else if (lowerCmd === "hostname") {
      output = "musicd-server"
    } else if (lowerCmd === "cd" || lowerCmd === "cd ~" || lowerCmd === `cd ${HOME_DIR}`) {
      setCurrentDir(HOME_DIR)
      output = ""
    } else if (lowerCmd === "cd /" || trimmed === "cd /") {
      setCurrentDir("/")
      output = ""
    } else if (lowerCmd === "cd .." || trimmed === "cd..") {
      const parent = currentDir.split("/").slice(0, -1).join("/") || "/"
      if (parent === "/" || parent === "/home" || parent === HOME_DIR || parent === "/home/musicd/songs") {
        setCurrentDir(parent)
        output = ""
      } else {
        output = "bash: cd: ..: Permission denied"
        tone = "error"
      }
    } else if (lowerCmd.startsWith("cd ")) {
      const target = trimmed.slice(3).trim()
      const newPath = resolvePath(target, currentDir)

      if (newPath === HOME_DIR || newPath === "/home/musicd/songs" || newPath === "/" || newPath === "/home") {
        setCurrentDir(newPath)
        output = ""
      } else if (filesystem[newPath] === true) {
        setCurrentDir(newPath)
        output = ""
      } else {
        output = `bash: cd: ${target}: No such file or directory`
        tone = "error"
      }
    } else if (lowerCmd.startsWith("cat ")) {
      const fileName = trimmed.slice(4).trim()
      const filePath = resolvePath(fileName, currentDir)

      if (filePath === "/flag.txt") {
        output = "cat: /flag.txt: Permission denied\nhint: maybe there is another path into that file..."
        tone = "hint"
      } else if (filesystem[filePath] && typeof filesystem[filePath] === "string") {
        output = filesystem[filePath] as string
      } else if (filesystem[filePath] === true) {
        output = `cat: ${fileName}: Is a directory`
        tone = "error"
      } else {
        output = `cat: ${fileName}: No such file or directory`
        tone = "error"
      }
    } else if (lowerCmd === "cat") {
      output = "cat: missing operand"
      tone = "error"
    } else if (lowerCmd === "load" || lowerCmd === "load ") {
      output = "load: missing track name\nusage: load <song_name>"
      tone = "error"
    } else if (lowerCmd.startsWith("load ")) {
      const songName = trimmed.slice(5).trim()

      if (!songName) {
        output = "load: missing track name\nusage: load <song_name>"
        tone = "error"
      } else {
        const rawPath = `songs/${songName}`
        const parts = rawPath.split("/")
        const resolved: string[] = []
        for (const part of parts) {
          if (part === "..") resolved.pop()
          else if (part !== "." && part !== "") resolved.push(part)
        }
        const finalPath = `/${resolved.join("/")}`

        if (finalPath === "/flag.txt" || finalPath === "/flag") {
          setSolved(true)
          output = `> loading track: ${songName}
> reading from: /home/musicd/${rawPath}

som_loves_pencils_and_travel

[!] wait... that is not a song.`
          tone = "success"
        } else {
          const fullPath = `/home/musicd/${resolved.join("/")}`
          if (filesystem[fullPath] && typeof filesystem[fullPath] === "string") {
            output = `Now playing: ${songName}
${(filesystem[fullPath] as string).split("\n").slice(0, 3).join("\n")}...`
          } else {
            output = `load: ${songName}: track not found in songs/
hint: try "load paranoid_android.lrc" or inspect how the daemon builds file paths`
            tone = "hint"
          }
        }
      }
    } else if (trimmed === "som_loves_pencils_and_travel") {
      setSolved(true)
      output = "> flag accepted. nice work."
      tone = "success"
    } else if (lowerCmd === "flag" || lowerCmd === "getflag" || lowerCmd === "get flag") {
      output = "nice try. find it the fun way."
      tone = "warning"
    } else if (lowerCmd.startsWith("sudo ")) {
      output = `[sudo] password for som:
som is not in the sudoers file. This incident will be reported.`
      tone = "warning"
    } else if (lowerCmd === "su" || lowerCmd === "su root" || lowerCmd === "su -") {
      output = "su: Authentication failure"
      tone = "error"
    } else if (lowerCmd === "exit" || lowerCmd === "quit" || lowerCmd === "logout") {
      output = "logout\n\n...not yet. the playlist is still locked."
      tone = "warning"
    } else if (lowerCmd === "rm" || lowerCmd.startsWith("rm ")) {
      output = "rm: permission denied (nice try tho)"
      tone = "warning"
    } else if (
      lowerCmd === "vim" ||
      lowerCmd === "nano" ||
      lowerCmd === "vi" ||
      lowerCmd.startsWith("vim ") ||
      lowerCmd.startsWith("nano ")
    ) {
      output = "error: no editor found"
      tone = "error"
    } else if (lowerCmd === "man" || lowerCmd.startsWith("man ")) {
      output = 'man: no manual entry. use "help" or "guide" instead.'
      tone = "guide"
    } else if (lowerCmd === "touch" || lowerCmd.startsWith("touch ")) {
      output = "touch: cannot create file: Read-only file system"
      tone = "error"
    } else if (lowerCmd === "mkdir" || lowerCmd.startsWith("mkdir ")) {
      output = "mkdir: cannot create directory: Read-only file system"
      tone = "error"
    } else if (
      lowerCmd === "wget" ||
      lowerCmd === "curl" ||
      lowerCmd.startsWith("wget ") ||
      lowerCmd.startsWith("curl ")
    ) {
      output = "network: connection refused (no internet for you)"
      tone = "warning"
    } else if (lowerCmd === "ifconfig" || lowerCmd === "ip a" || lowerCmd === "ip addr") {
      output = "lo: 127.0.0.1\neth0: 10.0.0.42"
    } else if (lowerCmd === "ps" || lowerCmd === "ps aux") {
      output = `USER    PID  CMD
som       1  /bin/bash
som      42  ./daemon.sh`
    } else if (lowerCmd === "top" || lowerCmd === "htop") {
      output = "top: display too small (this is a tiny terminal)"
      tone = "warning"
    } else if (
      lowerCmd.startsWith("grep ") ||
      lowerCmd.startsWith("find ") ||
      lowerCmd.startsWith("locate ")
    ) {
      output = `${trimmed.split(" ")[0]}: command available but will not help you much here`
      tone = "warning"
    } else if (lowerCmd === "neofetch" || lowerCmd === "screenfetch") {
      output = `      _____
     /     \\     som@musicd-server
    |  O O  |    OS: MusicD Linux
    |   >   |    Shell: bash 5.1
     \\_____/     Terminal: web-term
                 CTF: ${solved ? "solved" : "unsolved"}`
    } else if (lowerCmd === "cowsay" || lowerCmd.startsWith("cowsay ")) {
      output = ` ________
< solve the CTF >
 --------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`
    } else if (lowerCmd === "sl") {
      output = "choo choo (you typed sl instead of ls)"
      tone = "warning"
    } else {
      output = `bash: ${trimmed.split(" ")[0]}: command not found
type "help" for available commands`
      tone = "error"
    }

    pushHistoryItem({ input: trimmed, output, cwd: commandCwd, tone })
    setInput("")
  }

  const handleQuickAction = (command: string) => {
    executeCommand(command)
    inputRef.current?.focus()
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault()
      if (cmdHistory.length > 0) {
        const newIndex = historyIndex < cmdHistory.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setInput(cmdHistory[cmdHistory.length - 1 - newIndex] || "")
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(cmdHistory[cmdHistory.length - 1 - newIndex] || "")
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput("")
      }
    } else if (event.key === "Tab") {
      event.preventDefault()

      const parts = input.split(" ")
      const lastPart = parts[parts.length - 1]
      const commandCompletions = [
        "help",
        "guide",
        "hint",
        "ls",
        "cd",
        "pwd",
        "cat",
        "load",
        "whoami",
        "clear",
        "history",
        "echo",
        "id",
        "reset",
      ]
      const fileCompletions = [
        "README.txt",
        "daemon.sh",
        "songs/",
        "songs/paranoid_android.lrc",
        "songs/comfortably_numb.lrc",
        ".bash_history",
        "../../flag.txt",
      ]
      const allCompletions = parts.length === 1 ? commandCompletions : fileCompletions
      const match = allCompletions.find((completion) => completion.toLowerCase().startsWith(lastPart.toLowerCase()))

      if (match) {
        parts[parts.length - 1] = match
        setInput(parts.join(" "))
      }
    }
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const handleTerminalClick = () => {
    inputRef.current?.focus()
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    executeCommand(input)
  }

  return (
    <motion.div
      data-world="nerdy"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-2 flex items-center gap-3">
        <span className="text-world">▌</span>
        <p className="font-mono text-xs uppercase tracking-widest text-ink-200">
          {solved ? "god playlist unlocked" : "musicd v0.1"}
        </p>
      </div>
      <p className="mb-6 text-sm text-ink-400">
        {solved
          ? "you found the weak spot in the daemon and unlocked the playlist."
          : "a tiny terminal puzzle dressed up like a sketchy music daemon. still the same idea, just less hostile to people who do not live in bash."}
      </p>

      {!solved ? (
        <div
          className="paper-card crt-scanlines relative cursor-text overflow-hidden border-ink-500 bg-ink-900 font-mono text-xs"
          onClick={handleTerminalClick}
        >
          <div className="relative z-[3] border-b border-ink-600 bg-ink-850 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 border border-ink-500 bg-ink-700" />
                  <span className="h-2.5 w-2.5 border border-ink-500 bg-ink-700" />
                  <span className="h-2.5 w-2.5 border border-ink-500 bg-ink-700" />
                </div>
                <span className="ml-3 inline-flex items-center gap-2 text-[0.7rem] text-ink-400">
                  <span className="h-1.5 w-1.5 animate-pulse bg-world" aria-hidden="true" />
                  som@musicd-server: {buildPromptPath(currentDir)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-ink-600 px-2 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-ink-300">
                  unsolved
                </span>
                <span className="border border-ink-600 px-2 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-ink-300">
                  hint level {hintLevel}/5
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    resetTerminal()
                  }}
                  className="inline-flex items-center gap-1 border border-ink-600 px-2 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-ink-300 transition-colors hover:border-world hover:text-ink-100"
                  aria-label="Reset terminal challenge"
                >
                  <RefreshCw className="h-3 w-3" />
                  reset
                </button>
              </div>
            </div>
          </div>

          <div className="relative z-[3] border-b border-ink-700 bg-ink-850 px-4 py-4">
            <div className="grid gap-3 md:grid-cols-[1.25fr_1fr]">
              <div className="border border-ink-600 bg-ink-800 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <TerminalSquare className="h-3.5 w-3.5 text-ink-300" />
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-300">
                    not a terminal person?
                  </p>
                </div>
                <p className="text-[0.72rem] leading-relaxed text-ink-400">
                  That is fine. Treat this like a tiny investigation, not a shell exam. Inspect files, read what the daemon does,
                  and ask for stronger hints whenever you want.
                </p>
              </div>
              <div className="border border-ink-600 bg-ink-800 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <CircleHelp className="h-3.5 w-3.5 text-ink-300" />
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-300">
                    recommended path
                  </p>
                </div>
                <p className="text-[0.72rem] leading-relaxed text-ink-400">
                  Start with <span className="text-world">help</span>, then inspect{" "}
                  <span className="text-world">README.txt</span> and{" "}
                  <span className="text-world">daemon.sh</span>. The exploit lives in how one command builds its file path.
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {STARTER_ACTIONS.map((action) => (
                <button
                  key={action.command}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleQuickAction(action.command)
                  }}
                  className="group/starter border border-ink-600 bg-transparent px-3 py-2 text-left transition-colors hover:border-world"
                  aria-label={`Run ${action.command}`}
                >
                  <span className="block font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-200 transition-colors group-hover/starter:text-world">
                    {action.label}
                  </span>
                  <span className="mt-1 block text-[0.68rem] text-ink-400">{action.command}</span>
                  <span className="mt-1 block text-[0.65rem] text-ink-500">{action.note}</span>
                </button>
              ))}
            </div>
          </div>

          <div ref={terminalRef} data-lenis-prevent className="relative z-[1] h-80 overflow-y-auto bg-ink-900 px-4 py-4 pr-2 scrollbar-thin">
            <div className="space-y-3">
              {history.map((item, index) => (
                <div key={`${index}-${item.cwd}-${item.input || "system"}`} className="space-y-1">
                  {item.input && (
                    <p className="text-ink-100">
                      <TerminalPrompt cwd={item.cwd} />
                      {item.input}
                    </p>
                  )}
                  {item.output && (
                    <div className={`whitespace-pre-wrap text-[0.8rem] leading-relaxed ${getToneClass(item.tone)}`}>
                      {item.output}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-[3] border-t border-ink-600 bg-ink-850 px-4 py-3">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="min-w-0 flex flex-1 items-center">
                <TerminalPrompt cwd={currentDir} />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='try "help", "cat daemon.sh", or "hint"'
                  className="min-w-0 flex-1 bg-transparent font-mono text-xs text-ink-100 caret-world outline-none placeholder:text-ink-500"
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </div>
              <button
                type="submit"
                className="inline-flex shrink-0 items-center gap-1 border border-ink-600 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-ink-300 transition-colors hover:border-world hover:text-ink-100"
              >
                <ArrowRight className="h-3 w-3" />
                run
              </button>
            </form>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[0.65rem] text-ink-500">
              <p>enter: run · tab: autocomplete · up/down: history</p>
              <p>hint gets stronger each time you use it</p>
            </div>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="paper-card crt-scanlines relative overflow-hidden border-ink-500 bg-ink-900 font-mono text-xs">
            <div className="relative z-[3] border-b border-ink-600 bg-ink-850 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 border border-world bg-world/20" />
                  <span className="inline-flex items-center gap-2 text-[0.7rem] text-ink-400">
                    musicd-server <span className="text-ink-600">//</span>{" "}
                    <span className="text-world">challenge solved</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetTerminal}
                  className="inline-flex items-center gap-1 border border-ink-600 px-2 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-ink-300 transition-colors hover:border-world hover:text-ink-100"
                >
                  <RefreshCw className="h-3 w-3" />
                  replay
                </button>
              </div>
            </div>

            <div className="relative z-[1] space-y-4 px-4 py-4">
              <div className="border border-world/30 bg-world/[0.06] p-3">
                <p className="text-world">Now playing: you found the weak spot.</p>
                <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-300">
                  The daemon trusted user input when building a file path. That let you walk out of the songs directory and
                  read something it was never meant to load.
                </p>
              </div>

              <div className="border border-ink-600 bg-ink-800 p-3">
                <p className="mb-2 text-[0.65rem] uppercase tracking-[0.16em] text-ink-400">winning command</p>
                <code className="text-[0.78rem] text-ink-100">load ../../flag.txt</code>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={PLAYLIST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-world/60 px-3 py-2 text-[0.7rem] uppercase tracking-[0.14em] text-world transition-colors hover:border-world hover:bg-world/10"
                >
                  open playlist
                </a>
                <button
                  type="button"
                  onClick={resetTerminal}
                  className="inline-flex items-center gap-2 border border-ink-600 px-3 py-2 text-[0.7rem] uppercase tracking-[0.14em] text-ink-300 transition-colors hover:border-world hover:text-ink-100"
                >
                  run it again
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
