// frontend/src/pages/adminUI/components/SearchHistoryTable.tsx
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../../components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";

interface SearchHistoryTableProps {
  tableData: Array<{
    id: string;
    user: string;
    userId: string;
    term: string;
    filters: string;
    timestamp: string;
  }>;
  isLoading: boolean;
}

const SearchHistoryTable: React.FC<SearchHistoryTableProps> = ({ tableData, isLoading }) => {
  const [filterText, setFilterText] = useState('');
  
  // Lọc dữ liệu bảng theo text nhập vào
  const filteredData = tableData.filter(row => 
    row.user.toLowerCase().includes(filterText.toLowerCase()) || 
    row.term.toLowerCase().includes(filterText.toLowerCase()) || 
    row.filters.toLowerCase().includes(filterText.toLowerCase())
  );
  
  // Kiểm tra nếu không có dữ liệu
  const hasNoData = !tableData || tableData.length === 0;

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>Recent Search History</CardTitle>
        <CardDescription>Most recent 20 searches from all users</CardDescription>
        {!hasNoData && (
          <div className="mt-2">
            <Input
              placeholder="Filter searches..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="max-w-sm"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-96 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
          </div>
        ) : hasNoData ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6">
            <svg
              className="h-8 w-8 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <h3 className="text-gray-600 font-medium">No search history available</h3>
            <p className="text-gray-500 text-sm">User search activity will appear here once available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">User</TableHead>
                  <TableHead>Search Term</TableHead>
                  <TableHead>Filters Applied</TableHead>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.user}</TableCell>
                      <TableCell>{row.term}</TableCell>
                      <TableCell>
                        {row.filters === 'None' ? (
                          <span className="text-gray-400">None</span>
                        ) : (
                          <span className="text-gray-600">{row.filters}</span>
                        )}
                      </TableCell>
                      <TableCell>{row.timestamp}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                      {filterText ? 'No searches match your filter' : 'No recent searches found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchHistoryTable;