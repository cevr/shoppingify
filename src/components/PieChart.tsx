import { PieDatum, ResponsivePie } from "@nivo/pie";

interface PieChartProps {
  data: PieDatum[];
}

export let PieChart = ({ data }: PieChartProps) => (
  <ResponsivePie
    data={data}
    margin={{ top: 20, right: 40, bottom: 40, left: 40 }}
    innerRadius={0.5}
    padAngle={0.7}
    cornerRadius={3}
    colors={{ scheme: "nivo" }}
    borderWidth={1}
    borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
    enableRadialLabels={false}
    radialLabelsSkipAngle={10}
    radialLabelsTextColor="#333333"
    radialLabelsLinkColor={{ from: "color" }}
  />
);
