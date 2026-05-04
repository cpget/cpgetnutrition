import prisma from "@/lib/prisma";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Megaphone } from "lucide-react";

export default async function AnnouncementBanner() {
  const announcement = await prisma.announcement.findUnique({
    where: { id: "GLOBAL" },
  });

  if (!announcement) return null;

  return (
    <Alert className="bg-blue-50 border-blue-200 mb-6">
      <Megaphone className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800 font-semibold">
        {announcement.title}
      </AlertTitle>
      <AlertDescription className="text-blue-700">
        {announcement.content}
        <div className="mt-1 text-[10px] opacity-70">
          Last updated: {new Date(announcement.updatedAt).toLocaleDateString()}
        </div>
      </AlertDescription>
    </Alert>
  );
}