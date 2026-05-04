import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth" // Adjust the path to where your options are defined

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }