export const dynamic = "force-dynamic";

import { Suspense } from "react";
import NewArticleClient from "@/components/articles/NewArticleClient";

export default function NewArticlePage() {
  return (
    <Suspense fallback={<div className="p-8">Caricamento...</div>}>
      <NewArticleClient />
    </Suspense>
  );
}
