"use client"

import React from 'react'

interface BlogContentProps {
  content: string
  className?: string
}

export function BlogContent({ content, className = "" }: BlogContentProps) {
  return (
    <div 
      className={`blog-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
