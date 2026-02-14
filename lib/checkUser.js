import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"; 

export const checkUser = async() => {
    // 1. Ask Clerk: "Who is currently logged in?"
    const user = await currentUser()

    // 2. If no one is logged in, stop right here.
    if(!user){
        return null;
    }

    try {
        // 3. Check our Database: "Do we already have a file for this person?"
        const loggedInUser = await db.user.findUnique({
            where: {
                clerkUserId: user.id
            }
        });

        // 4. If we found them (Old Guest), give back their info and finish.
        if(loggedInUser){
            return loggedInUser;    
        }

        // 5. If we didn't find them (New Guest), create a brand new file for them.
        const newUser = await db.user.create({  
            data: {
                clerkUserId: user.id,
                email: user.emailAddresses[0].emailAddress,
                // CAREFUL: This line needs backticks (`), not single quotes (') to work!
                name: '${user.firstName} ${user.lastName}',
                imageUrl: user.imageUrl,
            }
        });

        // 6. Give back the new file we just created.
        return newUser;
    } catch (error) {
        console.error("Error checking or creating user:", error);
        throw error;
    }
};