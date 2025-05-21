import { getUser } from "@/features/account/controllers/get-user";

import { CreateBook } from "./create-book";

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
