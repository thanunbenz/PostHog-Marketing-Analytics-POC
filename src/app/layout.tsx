import type { Metadata } from "next";
import { Suspense } from "react";
import { PostHogProvider } from "./providers";
import { PageviewTracker } from "@/components/PageviewTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeepRun · PostHog Marketing-Analytics POC",
  description: "Funnel + first-touch UTM + server-side subscription_started.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          {/* useSearchParams() needs a Suspense boundary in the App Router. */}
          <Suspense fallback={null}>
            <PageviewTracker />
          </Suspense>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
