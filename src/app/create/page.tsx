import { CreateBook } from "./create-book";
import { getUser } from "@/features/account/controllers/get-user";

export default async function CreatePage() {
    const user = await getUser();
    if (!user) {
        return (
            <div>
                User not found!
            </div>
        );
    } else return (
        <>
            <CreateBook userId={user.id} />
        </>
    );
}
