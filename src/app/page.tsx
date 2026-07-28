import { getServerSession } from "next-auth";
import ThoughtDumpClient from "./ThoughtDumpClient";

export default async function Home() {
  const session = await getServerSession();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-6xl font-extrabold tracking-tighter text-primary">Dump.</h1>
            <p className="text-muted-foreground text-xl">A zero-friction space for your mind.</p>
          </div>
          <a href="/api/auth/signin" className="inline-block bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-opacity shadow-xl hover:shadow-2xl">
            Login to start typing
          </a>
        </div>
      </div>
    );
  }

  return <ThoughtDumpClient />;
}
