// "use client"

// import { dataUrl, debounce, download, getImageSize } from '@/lib/utils'
// import { CldImage, getCldImageUrl } from 'next-cloudinary'
// import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props'
// import Image from 'next/image'
// import React from 'react'

// const TransformedImage = ({ image, type, title, transformationConfig, isTransforming, setIsTransforming, hasDownload = false }: TransformedImageProps) => {
//   const downloadHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
//     e.preventDefault();

//     download(getCldImageUrl({
//       width: image?.width,
//       height: image?.height,
//       src: image?.publicId,
//       ...transformationConfig
//     }), title)
//   }

//   return (
//     <div className="flex flex-col gap-4">
//       <div className="flex-between">
//         <h3 className="h3-bold text-dark-600">
//           Transformed
//         </h3>

//         {hasDownload && (
//           <button 
//             className="download-btn" 
//             onClick={downloadHandler}
//           >
//             <Image 
//               src="/assets/icons/download.svg"
//               alt="Download"
//               width={24}
//               height={24}
//               className="pb-[6px]"
//             />
//           </button>
//         )}
//       </div>

//       {image?.publicId && transformationConfig ? (
//         <div className="relative">
//           <CldImage 
//             width={getImageSize(type, image, "width")}
//             height={getImageSize(type, image, "height")}
//             src={image?.publicId}
//             alt={image.title}
//             sizes={"(max-width: 767px) 100vw, 50vw"}
//             placeholder={dataUrl as PlaceholderValue}
//             className="transformed-image"
//             onLoad={() => {
//               setIsTransforming && setIsTransforming(false);
//             }}
//             onError={() => {
//               debounce(() => {
//                 setIsTransforming && setIsTransforming(false);
//               }, 8000)()
//             }}
//             {...transformationConfig}
//           />

//           {isTransforming && (
//             <div className="transforming-loader">
//               <Image 
//                 src="/assets/icons/spinner.svg"
//                 width={50}
//                 height={50}
//                 alt="spinner"
//               />
//               <p className="text-white/80">Please wait...</p>
//             </div>
//           )}
//         </div>
//       ): (
//         <div className="transformed-placeholder">
//           Transformed Image
//         </div>
//       )}
//     </div>
//   )
// }

// export default TransformedImage

"use client"

import { dataUrl, debounce, download, getImageSize } from '@/lib/utils'
import { CldImage, getCldImageUrl } from 'next-cloudinary'
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import React from 'react'

const TransformedImage = ({ image, type, title, transformationConfig, isTransforming, setIsTransforming, hasDownload = false }: TransformedImageProps) => {
  
  // Get the correct publicId - could be publicId or public_id depending on the source
  const publicId = image?.publicId || image?.public_id;
  
  console.log('=== TransformedImage Render ===');
  console.log('Props received:');
  console.log('- image:', image);
  console.log('- publicId (fixed):', publicId);
  console.log('- type:', type);
  console.log('- transformationConfig:', transformationConfig);
  console.log('- isTransforming:', isTransforming);

  const downloadHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    download(getCldImageUrl({
      width: image?.width,
      height: image?.height,
      src: publicId,
      ...transformationConfig
    }), title)
  }

  // Check what we're actually rendering
  const shouldShowImage = publicId && transformationConfig;
  const shouldShowPlaceholder = !publicId || !transformationConfig;
  
  console.log('Rendering decision:');
  console.log('- shouldShowImage:', shouldShowImage);
  console.log('- shouldShowPlaceholder:', shouldShowPlaceholder);

  if (shouldShowImage) {
    const imageUrl = getCldImageUrl({
      width: getImageSize(type, image, "width"),
      height: getImageSize(type, image, "height"),
      src: publicId,
      ...transformationConfig
    });
    console.log('- Generated image URL:', imageUrl);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-between">
        <h3 className="h3-bold text-dark-600">
          Transformed
        </h3>

        {hasDownload && (
          <button 
            className="download-btn" 
            onClick={downloadHandler}
          >
            <Image 
              src="/assets/icons/download.svg"
              alt="Download"
              width={24}
              height={24}
              className="pb-[6px]"
            />
          </button>
        )}
      </div>

      {shouldShowImage ? (
        <div className="relative">
          <CldImage 
            width={getImageSize(type, image, "width")}
            height={getImageSize(type, image, "height")}
            src={publicId}
            alt={image?.title || title}
            sizes={"(max-width: 767px) 100vw, 50vw"}
            placeholder={dataUrl as PlaceholderValue}
            className="transformed-image"
            onLoad={() => {
              console.log('✅ CldImage loaded successfully');
              setIsTransforming && setIsTransforming(false);
            }}
            onError={(error) => {
              console.error('❌ CldImage load error:', error);
              debounce(() => {
                setIsTransforming && setIsTransforming(false);
              }, 8000)()
            }}
            {...transformationConfig}
          />

          {isTransforming && (
            <div className="transforming-loader">
              <Image 
                src="/assets/icons/spinner.svg"
                width={50}
                height={50}
                alt="spinner"
              />
              <p className="text-white/80">Please wait...</p>
            </div>
          )}
        </div>
      ): (
        <div className="transformed-placeholder">
          <p>Transformed Image</p>
          {!publicId && <p className="text-sm text-gray-500">No image uploaded</p>}
          {!transformationConfig && <p className="text-sm text-gray-500">No transformation applied</p>}
        </div>
      )}
    </div>
  )
}

export default TransformedImage