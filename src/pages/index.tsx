import { Item } from "@prisma/client";
import { type NextPage } from "next"
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import CreateItemPortal from "../components/CreateItem";
import Table from "../components/Table";

import { api } from "../utils/api";

const useDeboundedQuery = (query: string) => {
  const [debouncedQuery, setDeboundedQuery] = useState(query)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDeboundedQuery(query)
    }, 500)

    return () => {
      clearTimeout(timeout)
    }
  }, [query])

  return debouncedQuery
}

const Home: NextPage = () => {
  const [createPortal, setCreatePortal] = useState(false)
  const [previousData, setPreviousData] = useState<Item[]>([])
  const [query, setQuery] = useState<string>("")
  const debouncedQuery = useDeboundedQuery(query)
  const { data, isRefetching } = api.item.getAll.useQuery(debouncedQuery, {
    queryKey: ["item.getAll", debouncedQuery],
    retry: false
  })

  useEffect(() => {
    if (isRefetching) setPreviousData(data?.items ?? [])
  }, [isRefetching])

  const total = useMemo(() => {
    return Intl.NumberFormat("default", { style: "currency", currency: "nok", currencyDisplay: 'code' }).format(data?.total ?? 0)
  }, [data, previousData])

  return (
    <>
      <Head>
        <title>Øøøøh?</title>
        <meta name="description" content="Funker fett" />
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="UTF-8" />
      </Head>
      <main className="grid grid-cols-3 bg-amber-50 p-4 min-h-screen">
        <div className="space-y-5 justify-self-center col-start-2 overflow-hidden max-w-screen-xl">
          <div className="flex justify-between items-center min-w-max gap-2 w-full">
            <input
              type="text"
              placeholder="Produkt..."
              value={query}
              onChange={e => setQuery(e.currentTarget.value)}
              className="h-14 w-72 border border-amber-100 outline-none focus:border-amber-200 rounded-full px-5 font-mono"
            />
            <p className="font-mono bg-white p-4 rounded-3xl">Rader: {(data?.items ?? previousData)?.length}</p>
            <p className="font-mono bg-white p-4 rounded-3xl">Total: {total}</p>
            <input
              type="button"
              className="
              transition-colors cursor-pointer h-14 w-52 border text-center
              bg-white border-yellow-300 hover:bg-amber-50
              rounded-full px-5 font-mono"
              value="Opprett ny rad"
              disabled
              onClick={() => setCreatePortal(true)}
            />
          </div>
          <Table data={data?.items ?? previousData} />
        </div>
      </main>
      {createPortal && <CreateItemPortal onClose={() => setCreatePortal(false)} />}
    </>
  )
};

export default Home;