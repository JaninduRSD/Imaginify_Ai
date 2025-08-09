"use server"

import { revalidatePath } from "next/cache"
import User from "../database/models/user.model"
import { connectTodatabase } from "../database/mongoose"
import { handleError } from "../utils";

//CREATE
export async function CreateUser(user: CreateUserParams ) {
    try{
        await connectTodatabase();

        const newUser = await User.create(user);
        return JSON.parse(JSON.stringify(newUser));
    }catch(error){
        handleError(error);
    }
    
}

// READ
export async function getUserById(userId: string) {
    try {
      await connectTodatabase();
  
      const user = await User.findOne({ clerkId: userId });
  
      if (!user) throw new Error("User not found");
      
  
      return JSON.parse(JSON.stringify(user));
    } catch (error) {
      handleError(error);
    }
  }


//update
export async function updateUser(clerkId: string, user: UpdateUserParams) {
try {
    await connectTodatabase();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
    new: true,
    });

    if (!updatedUser) throw new Error("User update failed");
    
    return JSON.parse(JSON.stringify(updatedUser));
} catch (error) {
    handleError(error);
}
}  

//delete
export async function DeleteUser(clerkId:string){
    try{
        await connectTodatabase();

        const userToDelete = await User.findOne({clerkId});
        if(!userToDelete){
            throw new Error("User not foumd");
        }
        const deletedUser = await User.findByIdAndDelete(userToDelete._id);
        revalidatePath('/');

        return deletedUser? JSON.parse(JSON.stringify(deletedUser)):null;
    }catch(error){
        handleError(error);
    }
}

//use credis
export async function updateCreadits(userId: string, creditFee: number){
    try{
        await connectTodatabase();
    
    const updatedUserCredits = await User.findOneAndUpdate(
        {_id: userId},
        {$inc:{credits:creditFee}},
        {new: true}
    )
    if (!updatedUserCredits) throw new Error ("User credits update failed");

    return JSON.parse(JSON.stringify
        (updatedUserCredits)
    );
}catch(error){
    handleError(error);
}
}


