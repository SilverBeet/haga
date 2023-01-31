import { Item } from "@prisma/client";
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { formatDate } from "../utils/time";

const columnHelper = createColumnHelper<Item>()

const columns = [
    columnHelper.accessor("shop", {
        header: "Butikk",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor("item_name", {
        header: "Produkt",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor("item_price", {
        header: "Pris",
        cell: info => info.getValue().toFixed(2),
    }),
    columnHelper.accessor("item_discount", {
        header: "Avslag",
        cell: info => (info.getValue() ?? 0).toFixed(2),
    }),
    columnHelper.accessor("volume", {
        header: "Volum",
        cell: info => (info.getValue() ?? 0).toFixed(2),
    }),
    columnHelper.accessor("weight", {
        header: "Vekt",
        cell: info => (info.getValue() ?? 0).toFixed(2),
    }),
    columnHelper.accessor("bought_at", {
        header: "Kjøpt",
        cell: info => formatDate(info.getValue()),
    }),
]

type TableProps = {
    data: Item[]
}


const Table: React.FC<TableProps> = ({ data }) => {


    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return <div className="bg-white rounded-xl overflow-x-hidden">
        <table className="table-auto min-w-max select-none">
            <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id} className="text-left text-black p-4 font-mono">
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="border-t cursor-pointer hover:bg-amber-50 transition-colors duration-700">
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="text-left text-black p-4 font-mono">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
            <tfoot>
                {table.getFooterGroups().map(footerGroup => (
                    <tr key={footerGroup.id}>
                        {footerGroup.headers.map(header => (
                            <th key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.footer,
                                        header.getContext()
                                    )}
                            </th>
                        ))}
                    </tr>
                ))}
            </tfoot>
        </table>
    </div>
}

export default Table;