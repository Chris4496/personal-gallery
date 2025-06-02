import  AppMasonryPhotoGallery  from "@/app/gallery"
import type { Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function Page() {
  return <AppMasonryPhotoGallery />
}