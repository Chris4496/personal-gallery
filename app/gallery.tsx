'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { Merriweather } from 'next/font/google'

const merriweather = Merriweather({ weight: ['400', '700'], subsets: ['latin'] })

interface ImageData {
  src: string
  alt: string
  title: string
}

const fallbackImages = [
  { src: '/placeholder.svg', alt: 'Fallback 1', title: 'Fallback 1' },
  { src: '/placeholder.svg', alt: 'Fallback 2', title: 'Fallback 2' },
  { src: '/placeholder.svg', alt: 'Fallback 3', title: 'Fallback 3' },
]

export default function AppMasonryPhotoGallery() {
  const [images, setImages] = useState<ImageData[]>([])
  const [imageSpans, setImageSpans] = useState<Record<string, number>>({})
  const [loadedImages, setLoadedImages] = useState(new Set<string>())
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const galleryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/images')
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error)
        }
        setImages(data.length > 0 ? data : fallbackImages)
      })
      .catch(error => {
        console.error('Error fetching images:', error)
        setError('Failed to load images. Please try again later.')
        setImages(fallbackImages)
      })
      .finally(() => setLoading(false))
  }, [])

  const calculateSpans = () => {
    const gallery = galleryRef.current
    if (!gallery) return

    const rowHeight = parseInt(window.getComputedStyle(gallery).getPropertyValue('grid-auto-rows'))
    const rowGap = parseInt(window.getComputedStyle(gallery).getPropertyValue('grid-row-gap'))
    console.log('calculateSpans:', { rowHeight, rowGap });

    const spans: Record<string, number> = {}
    gallery.childNodes.forEach((item) => {
      const img = (item as HTMLElement).querySelector('img')
      if (img) {
        const height = img.clientHeight
        const span = Math.ceil((height + rowGap) / (rowHeight + rowGap))
        console.log(`calculateSpans: alt=${img.alt}, clientHeight=${height}, span=${span}`);
        spans[img.alt] = span
      }
    })
    setImageSpans(spans)
  }

  useEffect(() => {
    if (loadedImages.size > 0) {
      calculateSpans()
    }
  }, [loadedImages])

  useEffect(() => {
    window.addEventListener('resize', calculateSpans)
    return () => window.removeEventListener('resize', calculateSpans)
  }, [])

  const handleImageLoad = (alt: string) => {
    setLoadedImages(prev => {
      const newSet = new Set(prev)
      newSet.add(alt)
      return newSet
    })
    setLoading(false)
  }

  const handleImageError = (image: ImageData) => {
    console.error(`Failed to load image: ${image.src}`)
    setImages(prevImages => prevImages.filter(img => img.src !== image.src))
    setLoadedImages(prev => {
      const newSet = new Set(prev)
      newSet.add(image.alt)
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-2 text-blue-600">Loading images...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: merriweather.className}}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="lg:text-9xl md:text-7xl text-5xl font-bold text-center text-black my-20">My Gallery</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div 
          ref={galleryRef} 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          style={{
            gridAutoRows: '10px'
          }}
        >
          {images.map((image) => (
            <Dialog key={image.src}>
              <DialogTrigger asChild>
                <div
                  className="relative w-full overflow-hidden cursor-pointer"
                  style={{
                    gridRowEnd: `span ${imageSpans[image.alt]}`,
                    minHeight: '200px',
                    height: 'fit-content'
                  }}
                >
                  <div className="relative w-full h-full overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={300}
                      height={200}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                      className="transition-transform duration-400 ease-in-out hover:scale-110 origin-center"
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="
                      onLoad={() => handleImageLoad(image.alt)}
                      onError={() => handleImageError(image)}
                    />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] p-4 overflow-hidden">
                <div className="relative w-full h-[80vh] bg-white">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    style={{
                      objectFit: 'contain',
                    }}
                    sizes="90vw"
                    className='p-4'
                  />
                </div>
                {image.title && (
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-black">{image.title}</h2>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          ))}
        </div>
        {images.length === 0 && (
          <h1 className="text-3xl font-bold text-center text-black p-7">No images to display. Please check your connection and try again.</h1>
        )}
      </div>
    </div>
  )
}