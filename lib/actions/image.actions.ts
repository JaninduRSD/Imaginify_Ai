"use server";

import { revalidatePath } from "next/cache";
import { connectTodatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";




//add image
export async function addImage({image, userId, path}:AddImageParams){
    try{
        await connectTodatabase();

        const author = await User.findById(userId);

        const newImage = await Image.create({
            ...image,
            author:author._id,
        })

        revalidatePath(path);

        return JSON.parse(JSON.stringify(newImage));
    }catch(error){
        handleError(error)
    }
}

//update
export async function updateImage({image, userId, path}:UpdateImageParams){
    try{
        await connectTodatabase();

        const imageToUpdate = await Image.findById(image._id);

        if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId){
            throw new Error("Unauthorized or image not found")
        }

        const updatedImage = await Image.findByIdAndUpdate(
            imageToUpdate._id,
            image,
            {new: true}
        )

        revalidatePath(path);

        return JSON.parse(JSON.stringify(updatedImage));
    }catch(error){
        handleError(error)
    }
}

//delete image
export async function deleteImage({image, userId, path}:DeleteImageP){
    try{
        await connectTodatabase();

        revalidatePath(path);

        return JSON.parse(JSON.stringify(image));
    }catch(error){
        handleError(error)
    }
}

//get image

export async function getImage({image, userId, path}:AddImageParams){
    try{
        await connectTodatabase();

        revalidatePath(path);

        return JSON.parse(JSON.stringify(image));
    }catch(error){
        handleError(error)
    }
}