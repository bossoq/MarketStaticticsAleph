import React, { useState, useEffect } from "react";

// const tableData: { [k: string]: number }[] = await allReturnsDefault({
//   indicator: "yearly",
//   asof: "2021-07-30",
// });
export default function MainTable({ queryDB }: { queryDB: any }): JSX.Element {
  const [tableData, setTableData] = useState<{[k: string]: number}[]>([])
  const [isPulling, setIsPulling] = useState<boolean>(true)
  
  useEffect(() => {
    queryDB.allBondDate().then((data: Date[]) => {
      queryDB.allReturnsDefault({
        indicator: "yearly",
        asof: data.slice(-1)[0],
      }).then((data: { [k: string]: number }[]) => {
        setTableData(data)
        setIsPulling(false)
      })
    })
  }, [])
  return (
      <div className="columns is-desktop is-multiline is-centered is-vcentered">
        <div className="column">
          <table className="table is-fullwidth is-hoverable has-text-centered">
            <thead key="tableHead">
              <tr>
                {!isPulling && (Object.keys(tableData[0]).map((head) => {
                  return <th key={head}>{head}</th>;
                }))}
              </tr>
            </thead>
            <tbody key="tableBody">
              {!isPulling && (Object.values(tableData).map((data) => {
                return (
                  <tr key={data.Period}>
                    {Object.entries(data).map((cell) => {
                      if (cell[0] === "Period") {
                        return <td key={cell[0]}>{cell[1]}</td>;
                      } else {
                        return (
                          <td key={cell[0]}>{`${cell[1].toFixed(2)}%`}</td>
                        );
                      }
                    })}
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
  );
}
