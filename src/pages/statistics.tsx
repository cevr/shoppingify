import * as React from "react";
import Head from "next/head";
import { Listbox } from "@headlessui/react";
import clsx from "clsx";

import { Popover, PieChart } from "@components/index";
import {
  MonthlyTopStatisticTuple,
  makePieChartData,
  useTopCategories,
  useTopCategoriesByMonth,
  useTopItems,
  useTopItemsByMonth,
} from "@lib/statistics.utils";

let Statistics = () => {
  let topItems = useTopItems();
  let topItemsByMonth = useTopItemsByMonth();
  let topCategories = useTopCategories();
  let topCategoriesByMonth = useTopCategoriesByMonth();

  return (
    <>
      <Head>
        <title>Shoppingify | Statistics</title>
      </Head>

      <div className="flex flex-col justify-between h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <TopStatistic stats={topItems} label="Top Items" color="info" />
          <TopStatistic
            stats={topCategories}
            label="Top Categories"
            color="primary"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <TopMonthlyStatistic label="Items" stats={topItemsByMonth} />
          <TopMonthlyStatistic
            label="Categories"
            stats={topCategoriesByMonth}
          />
        </div>
      </div>
    </>
  );
};

export default Statistics;

interface TopStatisticProps {
  label: string;
  stats: [string, number][];
  color: "primary" | "info";
}

let TopStatistic = ({ label, stats, color }: TopStatisticProps) => {
  let total = React.useMemo(
    () => stats.reduce((total, [, count]) => total + count, 0),
    [stats]
  );
  return (
    <div>
      <h2 className="mb-8 text-xl">{label}</h2>
      {stats.slice(0, 3).map(([item, count]) => {
        let percentage = Math.round((count / total) * 100);
        return (
          <div className="mb-6" key={item}>
            <div className="flex justify-between mb-4">
              <span>{item}</span>
              <span>{percentage}%</span>
            </div>
            <div className="rounded-full overflow-hidden bg-gray-400 w-full h-2">
              <div
                className={`bg-brand-${color} h-full`}
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface TopMonthlyStatisticProps {
  stats: MonthlyTopStatisticTuple[];
  label: string;
}

let TopMonthlyStatistic = ({ stats, label }: TopMonthlyStatisticProps) => {
  let [activeMonth, setActiveMonth] = React.useState(0);

  let topCategories = stats[activeMonth];

  if (!topCategories) {
    return null;
  }

  let [month, totals] = topCategories;
  return (
    <div>
      <h2 className="relative text-xl">
        Top {label} in{" "}
        <MonthSelect
          value={month}
          onChange={setActiveMonth}
          months={stats.map(([key]) => key)}
        />
      </h2>
      <div style={{ height: 300 }}>
        <PieChart data={totals.map(makePieChartData)} />
      </div>
    </div>
  );
};

interface MonthSelectProps {
  months: string[];
  value: string;
  onChange: (month: number) => void;
}

let MonthSelect = ({ months, value, onChange }: MonthSelectProps) => {
  let [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  return (
    <Listbox
      value={value}
      onChange={(nextMonth) =>
        onChange(months.findIndex((month) => month === nextMonth))
      }
    >
      {({ open }) => (
        <>
          <span ref={setAnchor}>
            <Listbox.Button className="text-left rounded-lg p-2 border-2 focus:border-brand-primary focus:outline-none text-gray-900">
              {value}
            </Listbox.Button>
          </span>

          <Popover anchor={anchor} open={open} placement="bottom-start">
            <div>
              <Listbox.Options
                static
                className="border rounded-lg shadow-sm border-gray-200 bg-white p-1 outline-none mt-4 overflow-y-auto"
                style={{
                  maxHeight: "10rem",
                }}
              >
                {months.map((month) => (
                  <Listbox.Option as={React.Fragment} key={month} value={month}>
                    {({ active, selected }) => (
                      <li
                        className={clsx(
                          "flex justify-between items-center rounded-lg text-gray-500 px-3 py-2 focus:outline-none",
                          {
                            "bg-orange-100 text-brand-primary": selected,
                            "bg-gray-100 text-gray-900": active || selected,
                          }
                        )}
                      >
                        {month}
                      </li>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Popover>
        </>
      )}
    </Listbox>
  );
};
