import { redirect } from "next/navigation";

export default function StaffDevicesRedirectPage() {
	redirect("/staff/inventory");
}