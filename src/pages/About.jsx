export default function About() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold tracking-tight">About</h1>
      <p className="max-w-2xl text-base md:text-lg leading-relaxed">
        This platform helps schools manage tests, track student progress, and download results. It is designed with a
        clean, monochrome aesthetic inspired by your mockups and uses the Montserrat font for a modern, readable look.
      </p>
      <div className="border-2 border-black p-5 bg-white max-w-xl">
        <h2 className="text-2xl font-bold">36-School Testing System</h2>
        <p className="mt-2 text-sm">
          Built with React + Vite, TailwindCSS, and Firebase Firestore. Admins can create tests with per-question scores,
          and results are grouped by sessions with export options.
        </p>
      </div>
    </div>
  )
}
