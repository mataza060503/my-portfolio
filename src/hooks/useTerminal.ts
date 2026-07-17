"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/* ============================================
   useTerminal — extracted terminal logic
   so it can be reused by any 3D scene
   ============================================ */

export interface CmdEntry {
  type: "input" | "output";
  text: string;
}

const COMMANDS: Record<string, string | string[]> = {
  help: [
    " Available commands:",
    "   help       Show this message",
    "   about      About me",
    "   skills     My tech stack",
    "   projects   Featured projects",
    "   contact    How to reach me",
    "   clear      Clear the terminal",
  ],
  about: [
    " +------------------------------------------+",
    " |  Vo Hoang Lam - AI Software Engineer     |",
    " |  Dong Nai, Vietnam                       |",
    " |                                          |",
    " |  1+ Year building AI-powered enterprise  |",
    " |  apps, modernizing manufacturing, and    |",
    " |  shipping full-stack solutions.          |",
    " +------------------------------------------+",
  ],
  skills: [
    " +- Tech Stack ----------------------------+",
    " | Frontend:  React, Next.js, Angular,      |",
    " |            TypeScript, Tailwind CSS       |",
    " | Backend:   Django, Python, .NET, SQL     |",
    " | Mobile:    Flutter, Android, RFID         |",
    " | AI:        LangChain, RAG, GPT, Pinecone |",
    " | Tools:     Git, Nix, TightVNC            |",
    " +-------------------------------------------+",
  ],
  projects: [
    " +- Featured Projects ---------------------+",
    " | * UEL GenAI Retrieval System             |",
    " |   RAG + LangChain + GPT + Pinecone       |",
    " | * WMS Modernization                      |",
    " |   React + Flutter + RFID Scanning        |",
    " | * TPM System                             |",
    " |   React + Flutter + Python + Django      |",
    " | * VNC Helper (.NET + TightVNC)           |",
    " +-------------------------------------------+",
  ],
  contact: [
    " +- Contact -------------------------------+",
    " | Email:   liamvo0605.work@gmail.com       |",
    " | GitHub:  github.com/mataza060503         |",
    " | LinkedIn: linkedin.com/in/lam-vo         |",
    " | Location: Dong Nai, Vietnam              |",
    " +-------------------------------------------+",
  ],
};

export interface TerminalState {
  history: CmdEntry[];
  input: string;
  focused: boolean;
}

export function useTerminal() {
  const [history, setHistory] = useState<CmdEntry[]>([
    { type: "output", text: 'Welcome! Type "help" to get started.' },
  ]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [focused, setFocused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const processCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;
    const entry: CmdEntry = { type: "input", text: `C:\\> ${cmd}` };
    setHistory((prev) => [...prev, entry]);
    if (trimmed === "clear") {
      setHistory([]);
      return;
    }
    const output = COMMANDS[trimmed];
    if (output) {
      const lines = Array.isArray(output) ? output : [output];
      setHistory((prev) => [
        ...prev,
        ...lines.map((line) => ({ type: "output" as const, text: line })),
      ]);
    } else {
      setHistory((prev) => [
        ...prev,
        { type: "output", text: `Unknown command: "${trimmed}". Type "help".` },
      ]);
    }
  }, []);

  const submit = useCallback(() => {
    if (!input.trim()) return;
    processCommand(input.trim());
    setCommandHistory((prev) => [input.trim(), ...prev]);
    setInput("");
    setHistoryIndex(-1);
  }, [input, processCommand]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      const { key } = e;

      if (key === "Enter") {
        e.preventDefault();
        submit();
        return "ENTER" as const;
      }
      if (key === "ArrowUp") {
        e.preventDefault();
        if (commandHistory.length > 0) {
          const ni = Math.min(historyIndex + 1, commandHistory.length - 1);
          setHistoryIndex(ni);
          setInput(commandHistory[ni]);
        }
        return null;
      }
      if (key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex > 0) {
          const ni = historyIndex - 1;
          setHistoryIndex(ni);
          setInput(commandHistory[ni]);
        } else {
          setHistoryIndex(-1);
          setInput("");
        }
        return null;
      }
      if (key === "Backspace") {
        return "BKS" as const;
      }
      if (key === "Escape") {
        return "ESC" as const;
      }
      if (key === "Tab") {
        e.preventDefault();
        return "TAB" as const;
      }
      // For printable characters, return the key for keycap animation
      if (key.length === 1) {
        return key;
      }
      return null;
    },
    [commandHistory, historyIndex, submit],
  );

  const focus = useCallback(() => setFocused(true), []);
  const blur = useCallback(() => setFocused(false), []);

  return {
    history,
    input,
    focused,
    setInput,
    submit,
    handleKeyDown,
    focus,
    blur,
    bottomRef,
  };
}
