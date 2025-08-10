"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from "@/constants"
import { CustomField } from "./CustomField"
import { useEffect, useState, useTransition } from "react"
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils"
import MediaUploader from "./MediaUploader"
import TransformedImage from "./TransformedImage"
import { updateCredits } from "@/lib/actions/user.actions"
import { getCldImageUrl } from "next-cloudinary"
import { addImage, updateImage } from "@/lib/actions/image.actions"
import { useRouter } from "next/navigation"
import { InsufficientCreditsModal } from "./InsufficientCreditsModal"
 
export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
})

const TransformationForm = ({ action, data = null, userId, type, creditBalance, config = null }: TransformationFormProps) => {
  const transformationType = transformationTypes[type];
  const [image, setImage] = useState(data)
  const [newTransformation, setNewTransformation] = useState<Transformations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState(config)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const initialValues = data && action === 'Update' ? {
    title: data?.title,
    aspectRatio: data?.aspectRatio,
    color: data?.color,
    prompt: data?.prompt,
    publicId: data?.publicId,
  } : defaultValues

   // 1. Define your form.
   const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  })
 
  
  // async function onSubmit(values: z.infer<typeof formSchema>) {
  //   setIsSubmitting(true);

  //   if(data || image) {
  //     const transformationUrl = getCldImageUrl({
  //       width: image?.width,
  //       height: image?.height,
  //       src: image?.publicId,
  //       ...transformationConfig
  //     })

  //     const imageData = {
  //       title: values.title,
  //       publicId: image?.publicId,
  //       transformationType: type,
  //       width: image?.width,
  //       height: image?.height,
  //       config: transformationConfig,
  //       secureURL: image?.secureURL,
  //       transformationURL: transformationUrl,
  //       aspectRatio: values.aspectRatio,
  //       prompt: values.prompt,
  //       color: values.color,
  //     }

  //     if(action === 'Add') {
  //       try {
  //         const newImage = await addImage({
  //           image: imageData,
  //           userId,
  //           path: '/'
  //         })

  //         if(newImage) {
  //           form.reset()
  //           setImage(data)
  //           router.push(`/transformations/${newImage._id}`)
  //         }
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }

  //     if(action === 'Update') {
  //       try {
  //         const updatedImage = await updateImage({
  //           image: {
  //             ...imageData,
  //             _id: data._id
  //           },
  //           userId,
  //           path: `/transformations/${data._id}`
  //         })

  //         if(updatedImage) {
  //           router.push(`/transformations/${updatedImage._id}`)
  //         }
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }
  //   }

  //   setIsSubmitting(false)
  // }

  // In your onSubmit function, replace this part:
async function onSubmit(values: z.infer<typeof formSchema>) {
  setIsSubmitting(true);

  if(data || image) {
    // Get the correct publicId
    const publicId = image?.publicId || image?.public_id;
    
    const transformationUrl = getCldImageUrl({
      width: image?.width,
      height: image?.height,
      src: publicId, // Use the fixed publicId
      ...transformationConfig
    })

    const imageData = {
      title: values.title,
      publicId: publicId, // Use the fixed publicId
      transformationType: type,
      width: image?.width,
      height: image?.height,
      config: transformationConfig,
      secureURL: image?.secureURL || image?.secure_url, // Also fix secureURL
      transformationURL: transformationUrl,
      aspectRatio: values.aspectRatio,
      prompt: values.prompt,
      color: values.color,
    }

    // Rest of your onSubmit code remains the same...
    if(action === 'Add') {
            try {
              const newImage = await addImage({
                image: imageData,
                userId,
                path: '/'
              })
    
              if(newImage) {
                form.reset()
                setImage(data)
                router.push(`/transformation/${newImage._id}`)
              }
            } catch (error) {
              console.log(error);
            }
          }
    
          if(action === 'Update') {
            try {
              const updatedImage = await updateImage({
                image: {
                  ...imageData,
                  _id: data._id
                },
                userId,
                path: `/transformation/${data._id}`
              })
    
              if(updatedImage) {
                router.push(`/transformation/${updatedImage._id}`)
              }
            } catch (error) {
              console.log(error);
            }
          }
      
  }

  setIsSubmitting(false)
}

  const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey]

    setImage((prevState: any) => ({
      ...prevState,
      aspectRatio: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height,
    }))

    setNewTransformation(transformationType.config);

    return onChangeField(value)
  }

  const onInputChangeHandler = (fieldName: string, value: string, type: string, onChangeField: (value: string) => void) => {
    debounce(() => {
      setNewTransformation((prevState: any) => ({
        ...prevState,
        [type]: {
          ...prevState?.[type],
          [fieldName === 'prompt' ? 'prompt' : 'to' ]: value 
        }
      }))
    }, 1000)();
      
    return onChangeField(value)
  }

  // const onTransformHandler = async () => {
  //   setIsTransforming(true)

  //   setTransformationConfig(
  //     deepMergeObjects(newTransformation, transformationConfig)
  //   )

  //   setNewTransformation(null)

  //   startTransition(async () => {
  //     await updateCredits(userId, creditFee)
  //   })
  // }

  const onTransformHandler = async () => {
    console.log('=== onTransformHandler started ===');
    console.log('Current state before transformation:');
    console.log('- image:', image);
    console.log('- newTransformation:', newTransformation);
    console.log('- transformationConfig:', transformationConfig);
    console.log('- type:', type);
  
    setIsTransforming(true)

    if (type === 'restore' || type === 'removeBackground') {
      console.log('✅ Auto-transform type - just updating credits');
      
      // Just update credits and reset the loading state
      startTransition(async () => {
        try {
          await updateCredits(userId, creditFee);
          console.log('✅ Credits updated successfully');
        } catch (error) {
          console.error('❌ Error updating credits:', error);
        } finally {
          // Reset loading state after credit update
          setIsTransforming(false);
        }
      });
      
      return; // Exit early for auto-transform types
    }
  
    // Check if newTransformation exists
    if (!newTransformation) {
      console.error('❌ No newTransformation available');
      setIsTransforming(false);
      return;
    }
  
    // Merge configurations
    const mergedConfig = deepMergeObjects(newTransformation, transformationConfig);
    console.log('- mergedConfig:', mergedConfig);
  
    setTransformationConfig(mergedConfig);
    setNewTransformation(null);
  
    console.log('=== Transformation applied ===');
  
    startTransition(async () => {
      try {
        await updateCredits(userId, creditFee);
        console.log('✅ Credits updated successfully');
      } catch (error) {
        console.error('❌ Error updating credits:', error);
      }
    });
  
    // Don't set isTransforming to false immediately - let the image onLoad handle it
  }

  // useEffect(() => {
  //   if(image && (type === 'restore' || type === 'removeBackground')) {
  //     setNewTransformation(transformationType.config)
  //   }
  // }, [image, transformationType.config, type])

  // In your TransformationForm component, modify the useEffect:

useEffect(() => {
  console.log('=== useEffect triggered ===');
  console.log('- image:', image);
  console.log('- type:', type);
  console.log('- transformationType.config:', transformationType.config);

  if(image && (type === 'restore' || type === 'removeBackground')) {
    console.log('✅ Setting newTransformation for auto-transform types');
    setNewTransformation(transformationType.config);
    
    // For these types, also immediately set the transformationConfig
    setTransformationConfig(transformationType.config);
  }
}, [image, transformationType.config, type])

// Also add this useEffect to debug when transformationConfig changes:
useEffect(() => {
  console.log('=== transformationConfig changed ===');
  console.log('New transformationConfig:', transformationConfig);
}, [transformationConfig])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}
        <CustomField 
          control={form.control}
          name="title"
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => <Input {...field} className="input-field" />}
        />

        {type === 'fill' && (
          <CustomField
            control={form.control}
            name="aspectRatio"
            formLabel="Aspect Ratio"
            className="w-full"
            render={({ field }) => (
              <Select
                onValueChange={(value) => onSelectFieldHandler(value, field.onChange)}
                value={field.value}
              >
                <SelectTrigger className="select-field">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(aspectRatioOptions).map((key) => (
                    <SelectItem key={key} value={key} className="select-item">
                      {aspectRatioOptions[key as AspectRatioKey].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}  
          />
        )}

        {(type === 'remove' || type === 'recolor') && (
          <div className="prompt-field">
            <CustomField 
              control={form.control}
              name="prompt"
              formLabel={
                type === 'remove' ? 'Object to remove' : 'Object to recolor'
              }
              className="w-full"
              render={({ field }) => (
                <Input 
                  value={field.value}
                  className="input-field"
                  onChange={(e) => onInputChangeHandler(
                    'prompt',
                    e.target.value,
                    type,
                    field.onChange
                  )}
                />
              )}
            />

            {type === 'recolor' && (
              <CustomField 
                control={form.control}
                name="color"
                formLabel="Replacement Color"
                className="w-full"
                render={({ field }) => (
                  <Input 
                    value={field.value}
                    className="input-field"
                    onChange={(e) => onInputChangeHandler(
                      'color',
                      e.target.value,
                      'recolor',
                      field.onChange
                    )}
                  />
                )}
              />
            )}
          </div>
        )}

        <div className="media-uploader-field">
          <CustomField 
            control={form.control}
            name="publicId"
            className="flex size-full flex-col"
            render={({ field }) => (
              <MediaUploader 
                onValueChange={field.onChange}
                setImage={setImage}
                publicId={field.value}
                image={image}
                type={type}
              />
            )}
          />

          <TransformedImage 
            image={image}
            type={type}
            title={form.getValues().title}
            isTransforming={isTransforming}
            setIsTransforming={setIsTransforming}
            transformationConfig={transformationConfig}
          />
        </div>

        <div className="flex flex-col gap-4">
        <Button 
            type="button"
            className="submit-button capitalize"
            disabled={
              isTransforming || 
              newTransformation === null ||
              (type === 'restore' || type === 'removeBackground') // Disable for auto-types
            }
            onClick={onTransformHandler}
          >
            {isTransforming ? 'Transforming...' : 
            (type === 'restore' || type === 'removeBackground') ? 
            'Auto-Applied' : 'Apply Transformation'}
          </Button>
          <Button 
            type="submit"
            className="submit-button capitalize"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Save Image'}
          </Button>

        </div>
      </form>
    </Form>
  )
}

export default TransformationForm