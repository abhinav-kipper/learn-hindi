'use client'

import { motion } from 'framer-motion'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-br-md shadow-sm'
            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm'
        }`}
      >
        {content}
      </div>
    </motion.div>
  )
}
