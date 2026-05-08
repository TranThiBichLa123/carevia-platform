import { redirect } from "next/navigation";

const Orders = () => {
  redirect("/client/account?tab=orders");
};

export default Orders;
