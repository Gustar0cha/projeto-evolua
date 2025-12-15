import { createClient } from '@supabase/supabase-js'

// Cliente Supabase - com fallback para evitar erros de build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Validação em runtime (apenas no cliente ou servidor, não durante build)
if (typeof window !== 'undefined' || process.env.NODE_ENV !== 'production') {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('⚠️ Supabase environment variables are not set. Using placeholder values.')
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos do banco de dados
export type Profile = {
    id: string
    name: string
    email?: string
    role: 'gestor' | 'colaborador'
    active: boolean
    created_at: string
    updated_at: string
}

export type Module = {
    id: string
    title: string
    description: string | null
    status: 'rascunho' | 'publicado'
    publish_at: string | null
    created_by: string | null
    created_at: string
    updated_at: string
}

export type Class = {
    id: string
    name: string
    description: string | null
    created_by: string | null
    created_at: string
    updated_at: string
}
