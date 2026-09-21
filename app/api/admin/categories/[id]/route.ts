import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()
  const { data: category, error } = await admin
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ category })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: isOwner } = await supabase.rpc('is_owner')
  if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  try {
    const body = await request.formData().catch(() => null)
    let updateData: any = {}
    
    if (body) {
      if (body.has('is_active')) {
        updateData.is_active = body.get('is_active') === 'true'
      }
    } else {
      updateData = await request.json()
    }

    const admin = createAdminClient()
    const { error } = await admin.from('categories').update(updateData).eq('id', id)
    if (error) throw error
    
    if (body) {
      // If it was a form post, redirect back to categories page
      return NextResponse.redirect(new URL('/admin/categories', request.url))
    }
    
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: isOwner } = await supabase.rpc('is_owner')
  if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const admin = createAdminClient()
  const { error } = await admin.from('categories').delete().eq('id', id)
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  return NextResponse.json({ success: true })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))
  const { data: isOwner } = await supabase.rpc('is_owner')
  if (!isOwner) return NextResponse.redirect(new URL('/', request.url))

  const { id } = await params
  const admin = createAdminClient()
  
  const formData = await request.formData()
  const method = formData.get('_method')
  
  if (method === 'DELETE') {
    await admin.from('categories').delete().eq('id', id)
  } else if (method === 'PATCH') {
    const is_active = formData.get('is_active')
    if (is_active !== null) {
      await admin.from('categories').update({ is_active: is_active === 'true' }).eq('id', id)
    }
  }
  
  return NextResponse.redirect(new URL('/admin/categories', request.url), 303)
}

