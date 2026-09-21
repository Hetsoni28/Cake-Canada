import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
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

  const admin = createAdminClient()
  const { data, error } = await admin.from('products').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: data })
}

export async function POST(request: Request) {
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

  try {
    const body = await request.json()
    const { variants, images, ...productData } = body
    const admin = createAdminClient()
    
    // Insert product
    const { data: product, error: pError } = await admin
      .from('products')
      .insert(productData)
      .select('id')
      .single()
      
    if (pError) throw pError
    
    // Insert variants
    if (variants && variants.length > 0) {
      const variantsData = variants.map((v: any, i: number) => ({
        ...v,
        product_id: product.id,
        sort_order: i
      }))
      const { error: vError } = await admin.from('product_variants').insert(variantsData)
      if (vError) throw vError
    }
    
    // Insert images
    if (images && images.length > 0) {
      const imagesData = images.map((url: string, i: number) => ({
        product_id: product.id,
        image_url: url,
        is_primary: i === 0,
        sort_order: i
      }))
      const { error: iError } = await admin.from('product_images').insert(imagesData)
      if (iError) throw iError
    }

    return NextResponse.json({ product_id: product.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
