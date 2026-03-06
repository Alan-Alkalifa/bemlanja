export function Hero() {
  return (
    <div className="flex flex-col gap-10 mobile:gap-16 items-center w-full">
      <div className="flex gap-6 mobile:gap-8 justify-center items-center">
        <a
          href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
          target="_blank"
          rel="noreferrer"
          className="transition-transform hover:scale-105"
        ></a>
        <span className="border-l border-border rotate-45 h-6" />
        <a
          href="https://nextjs.org/"
          target="_blank"
          rel="noreferrer"
          className="transition-transform hover:scale-105"
        ></a>
      </div>
      <h1 className="sr-only">Supabase and Next.js Starter Template</h1>
      <p className="text-2xl mobile:text-3xl laptop:text-4xl desktop:text-5xl leading-tight! mx-auto max-w-2xl text-center font-bold tracking-tight text-foreground">
        The fastest way to build apps with{" "}
        <a
          href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
          target="_blank"
          className="font-extrabold text-primary hover:text-primary/80 hover:underline transition-colors decoration-primary/50 underline-offset-4"
          rel="noreferrer"
        >
          Supabase
        </a>{" "}
        and{" "}
        <a
          href="https://nextjs.org/"
          target="_blank"
          className="font-extrabold text-primary hover:text-primary/80 hover:underline transition-colors decoration-primary/50 underline-offset-4"
          rel="noreferrer"
        >
          Next.js
        </a>
      </p>
      <div className="w-full max-w-3xl p-px bg-linear-to-r from-transparent via-border to-transparent my-6 mobile:my-8" />
    </div>
  );
}
