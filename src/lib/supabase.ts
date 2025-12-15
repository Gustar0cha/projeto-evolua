import { createClient } from '@supabase/supabase-js'

// Cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
