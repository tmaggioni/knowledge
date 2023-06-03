import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type PaginationState,
  type Updater,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { DataTablePagination } from '~/components/ui/table-pagination'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  hasPagination?: boolean
  pagination?: PaginationState
  setPagination?: (updater: Updater<PaginationState>) => void
  total?: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  setPagination,
  hasPagination,
  total,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    manualPagination: hasPagination,
    pageCount: total && pagination && Math.ceil(total / pagination.pageSize),
    state: {
      pagination: pagination || {
        pageIndex: 0,
        pageSize: 1,
      },
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='w-full rounded-md border'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                Sem resultado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {hasPagination && <DataTablePagination table={table} />}
    </div>
  )
}
