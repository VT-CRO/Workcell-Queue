const backendUrl = import.meta.env.VITE_BACKEND_URL;

const LoginButton = () => (
  <a
    href={`${backendUrl}/auth/login`}
    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
  >
    Log in with Discord
  </a>
);

export default LoginButton;
