import React from "react";
import { Admin, Resource } from "react-admin";
import fakeDataProvider from "ra-data-fakerest";
import { ReadingsList } from "./readings";
import Dashboard from "./Dashboard";
import PublicSharpIcon from "@material-ui/icons/PublicSharp";
import authProvider from "./authProvider";
import data from "./assets/soil-moisture-data-reduced.json";

const dataProvider = fakeDataProvider({ moisture_readings: data });

const App = () => (
  <Admin
    dashboard={() => <Dashboard data={data} />}
    authProvider={authProvider}
    dataProvider={dataProvider}
    title="Soil Moisture Dashboard"
  >
    <Resource name="moisture_readings" list={ReadingsList} icon={PublicSharpIcon} />
  </Admin>
);

export default App;
