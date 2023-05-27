import { useRouter } from "next/router";
import { api } from "~/utils/api";

const DashBoard = () => {
  const router = useRouter();
  const { mutate: logout } = api.auth.logout.useMutation();
  return (
    <div className="flex h-screen flex-col justify-center bg-black align-middle text-white">
      Ola DashBoard
      <button
        onClick={() =>
          logout(undefined, { onSuccess: () => router.push("/login") })
        }
      >
        Deslogar
      </button>
    </div>
  );
};

export default DashBoard;
