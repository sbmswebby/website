// app/api/upload/photo/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const supabaseClient = supabase
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const photo = formData.get('photo') as File

    if (!photo) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 })
    }

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(photo.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload JPEG, PNG, or WebP' 
      }, { status: 400 })
    }

    if (photo.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json({ 
        error: 'File size too large. Maximum 5MB allowed' 
      }, { status: 400 })
    }

    // Generate filename
    const fileExtension = photo.name.split('.').pop()
    const fileName = `user-photos/${user.id}/profile_${Date.now()}.${fileExtension}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await photo.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('user-photos')
      .upload(fileName, uint8Array, {
        contentType: photo.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Photo upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('user-photos')
      .getPublicUrl(fileName)

    // Update user profile with photo URL
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ 
        photo_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      // Photo uploaded but profile not updated - continue with success
    }

    return NextResponse.json({ 
      photo_url: urlData.publicUrl,
      message: 'Photo uploaded successfully'
    })
  } catch (error) {
    console.error('Photo upload API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

