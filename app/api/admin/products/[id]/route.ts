import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
  
  const { data: product, error: pError } = await admin
    .from('products')
    .select('*, product_variants(*), product_images(*)')
    .eq('id', id)
    .single()
    
  if (pError) return NextResponse.json({ error: pError.message }, { status: 500 })
  return NextResponse.json({ product })
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
    const body = await request.json()
    const { variants, images, ...productData } = body
    const admin = createAdminClient()
    
    // Update product
    if (Object.keys(productData).length > 0) {
      const { error: pError } = await admin.from('products').update(productData).eq('id', id)
      if (pError) throw pError
    }
    
    // Update variants (delete and re-insert for simplicity)
    if (variants) {
      await admin.from('product_variants').delete().eq('product_id', id)
      if (variants.length > 0) {
        const variantsData = variants.map((v: any, i: number) => ({
          ...v,
          product_id: id,
          sort_order: i
        }))
        const { error: vError } = await admin.from('product_variants').insert(variantsData)
        if (vError) throw vError
      }
    }
    
    // Update images (delete and re-insert for simplicity)
    if (images) {
      await admin.from('product_images').delete().eq('product_id', id)
      if (images.length > 0) {
        const imagesData = images.map((url: string, i: number) => ({
          product_id: id,
          image_url: url,
          is_primary: i === 0,
          sort_order: i
        }))
        const { error: iError } = await admin.from('product_images').insert(imagesData)
        if (iError) throw iError
      }
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
  
  // Hard delete cascade
  const { error } = await admin.from('products').delete().eq('id', id)
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
  
  const searchParams = new URL(request.url).searchParams
  const method = searchParams.get('_method')
  
  if (method === 'DELETE') {
    await admin.from('products').delete().eq('id', id)
  } else {
    const formData = await request.formData()
    const is_available = formData.get('is_available')
    if (is_available !== null) {
      await admin.from('products').update({ is_available: is_available === 'true' }).eq('id', id)
    }
  }
  
  return NextResponse.redirect(new URL('/admin/products', request.url), 303)
}
