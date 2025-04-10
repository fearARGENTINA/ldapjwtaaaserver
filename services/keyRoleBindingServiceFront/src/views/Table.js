import { Fragment, useEffect, useMemo } from "react";
import Spinner from "react-bootstrap/esm/Spinner";
import { useTable, usePagination, useExpanded, useSortBy, useFilters, useAsyncDebounce, useBlockLayout } from "react-table";
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import { BsCaretLeftFill, BsCaretRightFill } from 'react-icons/bs';
import { DefaultFilterForColumn } from "./Filter";

const TableComponent = ({
    columns,
    data,
    fetchData,
    pageCount: controlledPageCount,
    loading,
    isPaginated = true,
    selectedPageSize,
    totalCount, 
    ...props
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setHiddenColumns,
    state: { pageIndex, pageSize, filters },
  } = useTable(
    {
      columns,
      data,
      defaultColumn: {},
      initialState: {
        pageIndex: 0,
        pageSize: 10,
        hiddenColumns: columns
          .filter((column) => !column.show)
          .map((column) => column.id),
      },
      manualPagination: true,
      manualSortBy: true,
      manualFilters: true,
      autoResetPage: false,
      pageCount: controlledPageCount,
    },
    useBlockLayout,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination,
  );
  
  const fetchDataDebounced = useAsyncDebounce(fetchData, 100);
  useEffect(() => {
    fetchDataDebounced({ pageIndex, pageSize, filters });
  }, [fetchDataDebounced, pageIndex, pageSize, filters]);

  useEffect(() => {
    gotoPage(0);
  }, [filters])

  return (
    <Fragment>
      {
        <div>
          <div>
            <Table
              {...getTableProps()}
              striped bordered hover responsive
            >
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps()}
                      >
                        {column.render("Header")}
                        {column.canFilter ? column.render("Filter") : null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              { loading ? (
                <tbody>
                  <tr>
                    <td colSpan="100%">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </Spinner>
                    </td>
                  </tr>
                </tbody>
                
              ) : (
                <tbody
                  {...getTableBodyProps()}
                >
                  {page.map((row, i) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => {
                          return (
                            <td
                              {...cell.getCellProps()}
                            >
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              )}
            </Table>
            {Boolean(isPaginated) && (
              <>
                <>
                  {canPreviousPage ? (
                    <button onClick={() => previousPage()}>
                      <span>
                        <BsCaretLeftFill style={{cursor: 'pointer'}}/>
                      </span>
                      Atras
                    </button>
                  ) : null}{" "}
                  Página {pageIndex + 1} de {pageOptions.length} (total de {totalCount} accesos)
                  {" "}
                  {canNextPage ? (
                    <button onClick={() => nextPage()}>
                      Siguiente{" "}
                      <span>
                        <BsCaretRightFill style={{cursor: 'pointer'}}/>
                      </span>
                    </button>
                    ) : null
                  }
                </>
                <>
                  <Form.Select 
                    aria-label="Selecciona cantidad de filas"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="appearance-none block w-1/4 float-right px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {
                      [5, 10, 50, 100, 500, totalCount].map((size, i) => (
                        <option key={`${size}-${i}`} value={size}>{size}</option>
                      ))
                    }
                  </Form.Select>
                </>
              </>
            )}
          </div>
        </div>
      }
    </Fragment>
  );
};

export default TableComponent;