/// <reference lib="dom" />
import React, { useState } from "react";

export default function DatePicker({ queryDB }: { queryDB: any }): JSX.Element {
  const [allDateList, setAllDateList] = useState<Date[]>([]);
  queryDB.allBondDate().then((allDate: string[]) => {
    const startDate: Date = new Date(allDate.slice(0, 1)[0]);
    const endDate: Date = new Date(allDate.slice(-1)[0]);
    let dateRange: Date[] = [];
    for (
      let unix = startDate.getTime();
      unix <= endDate.getTime();
      unix += 86400000
    ) {
      const thisDay: Date = new Date(unix);
      const day = thisDay.getDate();
      const month = thisDay.getMonth();
      const year = thisDay.getFullYear();
      if (
        !allDate.includes(
          `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
            2,
            "0"
          )}`
        )
      ) {
        dateRange.push(thisDay);
      }
    }
    setAllDateList(dateRange);
    const startEnd: Date[] = [startDate, endDate];
    sessionStorage.setItem("allDateList", JSON.stringify(dateRange));
    sessionStorage.setItem("startEnd", JSON.stringify(startEnd));
  });
  return (
    <div className="columns is-desktop is-centered is-vcentered">
      <div className="column is-one-third">
        <div className="columns is-desktop is-centered is-vcentered">
          <div className="column is-one-third">
            <span className="is-size-4 has-text-weight-bold">Type:</span>
          </div>
          <div className="column is-two-thirds">
            <div className="select is-medium" style={{ width: "100%" }}>
              <select
                name="indicator"
                className="has-text-weight-bold"
                style={{ width: "100%" }}
                // onChange="onChangeSelection()"
              >
                <option>Yearly</option>
                <option>Monthly</option>
                <option>test</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="column is-one-third is-centered is-vcentered">
        <div className="columns is-desktop is-centered is-vcentered">
          <div className="column is-one-third">
            <label className="is-size-4 has-text-weight-bold">Data asof:</label>
          </div>
          <div className="column is-two-thirds">
            <input
              className="input is-medium has-text-centered has-text-weight-bold"
              type="text"
              name="datePicker"
              // changeDate="onChangeSelection(false)"
              readOnly
            />
          </div>
        </div>
      </div>
      <script>{`
      const month = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ]
      const dateElement = document.querySelector("input[name='datePicker']");
      const genDate = () => {
        if (window.sessionStorage.getItem("startEnd")) {
          dateElement.value = JSON.parse(window.sessionStorage.getItem("startEnd"))[1];
          const datePicker = new Datepicker(dateElement, {
            autohide: true,
            buttonClass: "button",
            format: {
              toValue(date) {
                const dateObj = new Date(date);
                return dateObj;
              },
              toDisplay(date) {
                const dateString = String(date.getDate()).padStart(2, "0");
                const monthString = month[date.getMonth()];
                const yearString = String(date.getFullYear());
                return dateString+"-"+monthString+"-"+yearString;
              },
            },
            todayHighlight: true,
            minDate: JSON.parse(window.sessionStorage.getItem("startEnd"))[0],
            maxDate: JSON.parse(window.sessionStorage.getItem("startEnd"))[1],
            datesDisabled: JSON.parse(window.sessionStorage.getItem("allDateList")),
          });
        } else {
          setTimeout(genDate, 0);
        }
      }
      setTimeout(genDate, 0);
      `}</script>
    </div>
  );
}
