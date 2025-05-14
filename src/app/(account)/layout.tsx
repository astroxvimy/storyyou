import { getSession } from "@/features/account/controllers/get-session";
import { redirect } from "next/navigation";

import { PropsWithChildren } from "react";

export default async function AccountLayout({children} :PropsWithChildren) {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }
    return (
        children
    )
}