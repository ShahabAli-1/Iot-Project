import * as React from "react";
import Grid from "@material-ui/core/Grid";
import { Card, CardContent, CardHeader } from "@material-ui/core";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import groupBy from "lodash/groupBy";
import moment from "moment";

// eslint-disable-next-line import/no-anonymous-default-export
export default ({ data }) => {
  console.log(data);
  const previousDayReadings = React.useMemo(() => {
    // filter data if reading timestamp is one day old
    return data
      .filter(
        (reading) =>
          new Date(reading.timestamp).getTime() < Date.now() - 24 * 60 * 60 * 1000 &&
          new Date(reading.timestamp).getTime() > Date.now() - 2 * 24 * 60 * 60 * 1000
      )
      .map((reading) => ({ ...reading, time: new Date(reading.timestamp).toLocaleTimeString() }));
  }, [data]);

  const previous30DaysData = React.useMemo(() => {
    // filter data if reading timestamp 30 days old
    const previousMonthData = data.filter(
      (reading) => new Date(reading.timestamp).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    );
    // group data by day
    const groupedData = groupBy(previousMonthData, (result) => moment(result.timestamp).format("YYYY-MM-DD"));
    const averageReadingPerDay = Object.keys(groupedData).map((key) => ({
      timestamp: key,
      soil_moisture:
        groupedData[key].reduce((acc, reading) => acc + reading.soil_moisture, 0) / groupedData[key].length,
    }));
    return averageReadingPerDay;
  }, [data]);

  const previousYearData = React.useMemo(() => {
    // filter data lying in previous year
    const previousYearData = data.filter(
      (reading) => new Date(reading.timestamp).getFullYear() === new Date().getFullYear() - 1
    );

    // group data by months
    const groupedData = groupBy(previousYearData, (result) => moment(result.timestamp).format("YYYY-MM"));
    return Object.keys(groupedData).map((key) => ({
      timestamp: key,
      soil_moisture:
        groupedData[key].reduce((acc, reading) => acc + reading.soil_moisture, 0) / groupedData[key].length,
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader title="Welcome to the Soil Moisture Dashboard" />
      <CardContent>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <h3>
              Previous Day Readings (
              {previousDayReadings.length > 0
                ? new Date(previousDayReadings[0].timestamp).toLocaleDateString()
                : "No readings available"}
              )
            </h3>
            <ResponsiveContainer width="100%" height={600}>
              <LineChart data={previousDayReadings} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                <Line type="monotone" dataKey="soil_moisture" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <h3>Past 30 days Average Readings</h3>
            <ResponsiveContainer width="100%" height={600}>
              <LineChart
                data={previous30DaysData}
                margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
                title="Daily reading in previous month"
              >
                <Line type="monotone" dataKey="soil_moisture" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="timestamp" fontSize={14} />
                <YAxis />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12}>
            <h3>Past Year Average Readings</h3>
            <ResponsiveContainer width="100%" height={600}>
              <LineChart
                data={previousYearData}
                margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
                title="Daily reading in previous month"
              >
                <Line type="monotone" dataKey="soil_moisture" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="timestamp" fontSize={14} />
                <YAxis />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
