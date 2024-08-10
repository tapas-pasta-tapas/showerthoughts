import { API_ROUTE } from "@/lib/routes";
import React from "react";

const dynamic = "force-dynamic";

type Props = {};

const page = async (props: Props) => {
  const { data } = await fetch(API_ROUTE + "/journal").then((res) => res.json());
  console.log(data);

  return <div>page</div>;
};

export default page;
