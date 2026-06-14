import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Landing from "@/components/Landing"
import Navbar from "@/components/Navbar"
import Footer from "@/components/footer"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <>
      <Navbar />
      <Landing session={session} />
      <Footer />
    </>
  )
}