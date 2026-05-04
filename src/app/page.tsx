import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Landing from "@/components/Landing"
import Navbar from "@/components/Navbar"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return ( 
    <>
      <Navbar />
      <Landing session={session} />
    </>
  )
}