import { useRouter } from "next/router";
import { Select } from "~/components/select"
import { api } from "~/utils/api";

const DashBoard = () => {
    const router = useRouter();
    const { mutate: logout } = api.auth.logout.useMutation();
    return (
        <div className="bg-black h-screen flex flex-col justify-center align-middle text-white">
            Ola DashBoard
            <button onClick={() => logout(undefined,{onSuccess:() => router.push('/login')})}>Deslogar</button>
        </div>
    )
}

export default DashBoard