import React from "react";
import { useDeno } from "framework/react"
import QueryDB from "~/lib/calcreturn.ts";
import DatePicker from "~/components/datepicker.tsx";
import MainTable from "~/components/table.tsx";
import Footer from "~/components/footer.tsx";

export default function Home(): JSX.Element {
  const [SUPABASEURL, SUPABASEAPI] = useDeno(() => [Deno.env.get("SUPABASEURL"), Deno.env.get("SUPABASEAPI")])
  const queryDB = new QueryDB(SUPABASEURL || "", SUPABASEAPI || "")
  return (
    <>
      <div className="container is-fullhd">
        <header className="mt-3 mb-6">
          <h1 className="title is-size-1 has-text-centered">
            SET Market Return
          </h1>
        </header>
        <DatePicker queryDB={queryDB} />
        <MainTable queryDB={queryDB} />
      </div>
      <Footer />
    </>
  );
}
