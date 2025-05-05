// frontend/src/pages/adminUI/components/UserTable.tsx
import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import Link from 'next/link';
import * as XLSX from 'xlsx';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  healthProfile?: {
    gender?: string;
    age?: number;
    goal?: string;
    activityLevel?: string;
  };
}

interface UserTableProps {
  data: User[];
}

const UserTable: React.FC<UserTableProps> = ({ data }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleExport = () => {
    const exportData = data.map(user => ({
      Name: user.name,
      Email: user.email,
      Gender: user.healthProfile?.gender || '',
      Age: user.healthProfile?.age || '',
      Goal: user.healthProfile?.goal || '',
      Activity: user.healthProfile?.activityLevel || '',
      Role: user.role || '',
      Registered: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'users.xlsx');
  };

  const columns: ColumnDef<User>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Gender', accessorFn: row => row.healthProfile?.gender || 'none' },
    { header: 'Age', accessorFn: row => row.healthProfile?.age ?? 'none' },
    { header: 'Goal', accessorFn: row => row.healthProfile?.goal || 'none' },
    { header: 'Activity', accessorFn: row => row.healthProfile?.activityLevel || 'none' },
    {
      header: 'Role',
      cell: ({ row }) => (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${row.original.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {row.original.role || 'user'}
        </span>
      ),
    },
    {
      header: 'Registered',
      accessorFn: row => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'none'
    },
    {
      header: 'Action',
      cell: ({ row }) => (
        <div className="text-center">
          <Link href={`/adminUI/UserDetails?userId=${row.original.id}`}>
            <button className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs">View</button>
          </Link>
        </div>
      )
    }
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-md">
      <div className="flex justify-end px-4 pt-4">
        <button
          onClick={handleExport}
          className="bg-indigo-600 text-white text-xs font-semibold px-3 py-2 rounded hover:bg-indigo-700"
        >
          Export Excel
        </button>
      </div>
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="px-4 py-3 font-semibold text-gray-700 cursor-pointer whitespace-nowrap hover:text-indigo-600"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="even:bg-gray-50 hover:bg-indigo-50">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-2 whitespace-nowrap text-gray-800">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4 px-4 py-2 text-sm">
        <div>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 rounded border text-gray-600 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 rounded border text-gray-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default UserTable;