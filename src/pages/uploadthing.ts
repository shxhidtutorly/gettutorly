import { createNextPageApiHandler } from "uploadthing/next";
import { ourFileRouter } from "@/uploadthing.config";

export default createNextPageApiHandler({
  router: ourFileRouter,
});
