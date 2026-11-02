'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"
import { Toaster } from "@/components/ui/sonner"

interface ProvidersProps {
    children: ReactNode
}

export function Providers({children}:ProvidersProps){
    const [client] =useState(
        new QueryClient({
            defaultOptions:{
                queries:{
                    refetchOnWindowFocus:false
                }
            }
        })
    )
    return (
        <QueryClientProvider client={client}>
            {children}
            <Toaster />
        </QueryClientProvider>
    )
}