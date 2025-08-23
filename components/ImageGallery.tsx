"use client";



import {
  ImageCarousel,
  ImageGrid,
} from '@/components/ImageComponents';


export const ImageGallery = () => {

const images = [
  { src: '/images/image1.jpeg', alt: 'Image.' },
  { src: '/images/image2.jpeg', alt: 'Image' },
  { src: '/images/image3.jpeg', alt: 'Image' },
  { src: '/images/image4.jpeg', alt: 'Image' },
  { src: '/images/image5.jpeg', alt: 'Image' },
];



  return (
    <div className="container mx-auto p-8">

      <ImageCarousel images={images} />

      <ImageGrid images={images}/>

    </div>
  );
};