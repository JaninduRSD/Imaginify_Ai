import { toast, useToast } from "@/hooks/use-toast";
import React from "react";
import {CldUploadWidget} from "next-cloudinary"




const MediaUploader = ({
    onValue
}) =>{
    const {toast} = useToast()
    const onUploadSuccessHandler = (result: any) => {
    
        toast({
          title: 'Image uploaded successfully',
          description: '1 credit was deducted from your account',
          duration: 5000,
          className: 'success-toast' 
        })
      }
    
    const onUploadErrorHandler = () => {
    toast({
        title: 'Something went wrong while uploading',
        description: 'Please try again',
        duration: 5000,
        className: 'error-toast' 
    })
    }
    


    return(
      <CldUploadWidget
        uploadPreset="jsm_imaginify"
        options={{
            multiple:false,
            resourceType:"image"
        }}
        onSuccess={onUploadSuccessHandler}
        onError={onUploadErrorHandler}>

            {({open})=>}
      </CldUploadWidget>
    )
}
export default MediaUploader