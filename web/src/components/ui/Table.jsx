import React from 'react';

export const Table = ({ children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-sm text-left whitespace-nowrap">
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className = '' }) => {
  return (
    <thead className={`bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 ${className}`}>
      {children}
    </thead>
  );
};

export const TableRow = ({ children, className = '' }) => {
  return (
    <tr className={`border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors ${className}`}>
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '' }) => {
  return (
    <th className={`px-6 py-3.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 text-zinc-700 dark:text-zinc-300 ${className}`}>
      {children}
    </td>
  );
};

export default Table;
