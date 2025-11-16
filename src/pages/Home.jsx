import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="mt-24 md:mt-28 pb-16 space-y-16">
      <section className="space-y-6">
        <div className="inline-block">
          <div className="relative">
            <div className="absolute -inset-3 bg-black" />
            <h1 className="relative z-10 text-4xl md:text-6xl font-extrabold text-white px-5 py-3">36-School Testing System</h1>
          </div>
        </div>
        <p className="max-w-2xl text-base md:text-lg leading-relaxed">
          Welcome to the 36-School Testing System! This platform allows teachers to easily create tests and quizzes,
          track student progress, and see detailed results. Students can register with their class and name, take tests
          online, and get instant feedback based on their performance.
        </p>
        <Link to="/tests" className="inline-block bg-black text-white px-6 py-3 rounded-none">Explore</Link>
      </section>

      <footer className="fixed bottom-0 left-0 w-full bg-black text-white px-4 py-3 text-sm">
        <div className="max-w-3xl mx-auto text-center">
          <span className="opacity-80">Creator:</span> Gulnoza Boybo’tayeva Abduvaxobovna
        </div>
      </footer>
    </div>
  )
}
