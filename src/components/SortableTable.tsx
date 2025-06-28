import React, { useState, useMemo, useRef, useEffect } from 'react';

export default function SortableTable({ children }: { children: React.ReactNode }) {
  const [sortConfig, setSortConfig] = useState<{ column: number; direction: 'asc' | 'desc' } | null>(null);

  // Extract <thead> and <tbody> children
  const thead = React.Children.toArray(children).find(
    (child: React.ReactNode) => child?.type?.displayName === 'thead' || child?.type === 'thead'
  );
  const tbody = React.Children.toArray(children).find(
    (child: React.ReactNode) => child?.type?.displayName === 'tbody' || child?.type === 'tbody'
  );

  const headers = React.Children.toArray((thead as React.ReactElement)?.props.children || []);
  const rows = React.Children.toArray((tbody as React.ReactElement)?.props.children || []);

  // Store the original order in a ref so it persists
  const originalRowsRef = useRef<React.ReactNode[]>([]);
  useEffect(() => {
    // Only set originalRowsRef if not set yet (so it doesn't update after sorting)
    if (originalRowsRef.current.length === 0 && rows.length > 0) {
      originalRowsRef.current = rows;
    }
  }, [rows]);

  // Use original rows if no sort, otherwise sort
  const sortedRows = useMemo(() => {
    if (!sortConfig) return originalRowsRef.current.length ? originalRowsRef.current : rows;
    return [...rows].sort((a: React.ReactNode, b: React.ReactNode) => {
      const aText = a.props.children[sortConfig.column]?.props?.children ?? '';
      const bText = b.props.children[sortConfig.column]?.props?.children ?? '';
      const order = sortConfig.direction === 'asc' ? 1 : -1;
      return String(aText).localeCompare(String(bText)) * order;
    });
  }, [rows, sortConfig]);

  const handleHeaderClick = (columnIndex: number) => {
    setSortConfig(prev => {
      if (prev?.column === columnIndex) {
        return { column: columnIndex, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { column: columnIndex, direction: 'asc' };
    });
  };

  // Reset handler
  const handleReset = () => {
    setSortConfig(null);
  };

  return (
    <div>
      {sortConfig && (
        <div className="mb-2 flex gap-2">
          <button
            onClick={handleReset}
            className="cursor-pointer px-2 py-1 text-xs !bg-gray-200 hover:!bg-gray-300 dark:!bg-[#262626] dark:hover:!bg-[#404040] rounded"
          >
            Reset Order
          </button>
        </div>
      )}
      <table className="w-fit min-w-[--thread-content-width] table-auto border-collapse">
        <thead className="font-bold">
          <tr className="border-b border-gray-500">
            {headers[0] &&
              React.Children.map((headers[0] as React.ReactNode).props.children, (th: React.ReactNode, i: number) => (
                <th
                  key={i}
                  onClick={() => handleHeaderClick(i)}
                  className="px-3 py-2 text-left font-semibold text-sm border-b border-gray-500 cursor-pointer"
                >
                  {th.props.children}
                  {sortConfig?.column === i ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row: React.ReactNode, i: number) => (
            <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
              {React.Children.map(row.props.children, (td: React.ReactNode) => (
                <td className="px-3 py-2 text-sm">{td.props.children}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
