'use client'

import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="flex flex-col gap-4 w-full max-w-[45vw] p-8 rounded-lg shadow-lg bg-white text-center">
        <p className="text-pink-400 ">
          It seems like you are not registered. Please sign up first.
        </p>
        <Link
          href="/login"
          className="inline-block w-40 mt-2 mx-auto bg-pink-100 text-pink-400 px-4 py-2 rounded hover:bg-pink-200 cursor-pointer"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
