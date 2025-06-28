import Link from "next/link";

function NotFound() {
  return (
    <>
    <div className="bg-black flex flex-col justify-center items-center min-h-[100vh] text-center py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="block text-9xl font-bold text-white">404</h1>
      <p className="mt-3 text-white dark:text-neutral-400">Oops, something went wrong.</p>
      <p className="text-white dark:text-neutral-400">Sorry, we couldn’t find your page.</p>
      <Link href="/" className='w-40 mt-4'>Return Home</Link> 
    </div>
    </>
  );
}

export default NotFound;