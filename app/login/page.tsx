import { login, signup } from './actions';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center ">
        
      <form
        method="post"
        className="flex flex-col gap-2 w-full max-w-[45vw] p-8 rounded-lg shadow-lg bg-white"
      >
        <label htmlFor="email" className="text-pink-400">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="border px-4 py-2 rounded shadow-sm"
        />
        <label htmlFor="password" className="text-pink-400">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="border px-4 py-2 rounded shadow-sm"
        />
        <div className="flex flex-col items-center mt-4 gap-2">
          <button
            formAction={login}
            className="w-75 mb-2 bg-pink-100 text-pink-400 px-4 py-2 rounded hover:bg-pink-200 cursor-pointer"
          >
            Log in
          </button>
          <button
            formAction={signup}
            className="w-75 mb-2 bg-pink-100 text-pink-400 px-4 py-2 rounded hover:bg-pink-200 cursor-pointer"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
