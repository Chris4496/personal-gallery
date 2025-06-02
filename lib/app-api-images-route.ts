import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const publicDir = path.join(process.cwd(), 'public')
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg']

  try {
    const files = fs.readdirSync(publicDir)
    const images = files
      .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => ({
        src: `/${file}`,
        alt: path.parse(file).name,
        title: path.parse(file).name
      }))

    if (images.length === 0) {
      console.warn('No images found in the public directory')
    }

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error reading public directory:', error)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}