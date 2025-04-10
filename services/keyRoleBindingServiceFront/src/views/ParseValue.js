function ParseValue({value, valueType, keyPrefix}) {
    return (() => {
        switch (valueType) {
            case "StrictBool":
                return value.toLowerCase()  
            case "StrictBoolSplit":
            case "StrictIntSplit":
            case "StrictStrSplit":
            case "List[StrictInt]":
            case "List[StrictBool]":
            case "List[StrictStr]":
                return <>
                    {
                        value.split(";").map((v) => v.trim()).map((v, i) => (
                            <span className="d-inline-block bg-primary border border-2 rounded m-1 rounded p-1" key={`comp-value-${keyPrefix}-${i}`}>
                                {v}
                            </span>
                        ))
                    }
                </>
            case "MatchAny":
                return "*"
            default:
                return value
        }
    })()
}

export default ParseValue;