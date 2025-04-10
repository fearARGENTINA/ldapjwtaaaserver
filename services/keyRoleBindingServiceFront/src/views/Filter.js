import { React, useRef, useState } from "react";
import { useAsyncDebounce } from "react-table";
import Form from 'react-bootstrap/Form';

// Component for Global Filter
export function GlobalFilter({ 
    globalFilter, 
    setGlobalFilter 
}) {
    const [value, setValue] = useState(globalFilter);
 
    const onChange = useAsyncDebounce((value) => {
        setGlobalFilter(value || undefined);
    }, 200);
 
    return (
        <div>
            <label>Buscar: </label>
            <input
                value={value || ""}
                onChange={(e) => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder="Ingrese busqueda"
                className="w-25"
                style={{
                    fontSize: "1.1rem",
                    margin: "15px",
                    display: "inline",
                }}
            />
        </div>
    );
}
 
// Component for Default Column Filter
export function DefaultFilterForColumn({
    column: {
        filterValue,
        setFilter,
    },
}) {
    return (
        <Form.Control
            type="text"
            value={filterValue || ''}
            onChange={(e) => {
                setFilter(e.target.value || undefined);
            }}
            placeholder={`Buscar`}
        />
    );
}
 
// Component for Custom Select Filter
export function SelectColumnFilter({
    column: { filterValue, setFilter, optionValues = [], castValue = null, key = "" },
  }) {  
    // Render a multi-select 
    return (
      <Form.Select
        value={filterValue}
        onChange={e => {
          if (castValue) {
              setFilter(castValue(e.target.value) || undefined)
          } else {
              setFilter(e.target.value || undefined)
          }
        }}
      >
        <option value="">Todos</option>
        {optionValues.map(({option, value}, i) => (
          <option key={`${key}-${i}`} value={value}>
            {option}
          </option>
        ))}
      </Form.Select>
    )
  }

// Component for Boolean Select Filter
export function BooleanSelectColumnFilter({
    column: { filterValue, setFilter, key = "" },
  }) {
    const options = ["Si", "No"]
  
    let val = ""
    switch (filterValue) {
        case true:
            val = "Si"
            break;
        case false:
            val = "No"
            break;
    }
    return (
      <Form.Select
        value={val}
        onChange={e => {
          if (e.target.value) {
              const fVal = e.target.value === "Si" ? true : false
              setFilter(fVal)
          } else {
            setFilter(undefined)
          }
        }}
      >
        <option value="">Todos</option>
        {options.map((option, i) => (
          <option key={`${key}-${i}`} value={option}>
            {option}
          </option>
        ))}
      </Form.Select>
    )
  }

export function DateRangeColumnFilter({
    column: { filterValue = {start: null, end: null, undefined: false}, setFilter, undefinedCheck = false }}) 
  {
    return (
        <div
        >
            <input
                value={filterValue.start || ""}
                type="date"
                max={"9999-12-30"}
                onChange={e => {
                    const val = e.target.value ? e.target.value : null;
                    setFilter((old = {start: null, end: null}) => ({ start: val, end: old.end}));
                }}
                style={{
                    display: "block",
                    width: "100%",
                }}
            />
            a
            <input
                value={filterValue.end || ""}
                type="date"
                max={"9999-12-30"}
                onChange={e => {
                    const val = e.target.value ? e.target.value : null;
                    setFilter((old = {start: null, end: null}) => ({ start: old.start, end: val}));
                }}
                style={{
                    display: "block",
                    width: "100%",
                }}
            />
            {
                undefinedCheck && 
                    <div
                        style={{
                            display: "block",
                            width: "100%"
                        }}
                    >
                        <span>Indefinido: </span>
                        <Form.Check 
                            type="switch" 
                            id="date-undefined" 
                            onChange={
                                (e) => setFilter(
                                    (old = {start: null, end: null, undefined: false}) => ({...old, undefined: !old.undefined}))
                            } 
                            checked={filterValue.undefined || false}
                        />
                    </div>
            }
        </div>
    );
}