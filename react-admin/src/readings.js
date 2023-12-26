import * as React from "react";
import { useMediaQuery } from "@material-ui/core";
import { List, SimpleList, Datagrid, TextField, FunctionField } from "react-admin";

export const ReadingsList = (props) => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  return (
    <List {...props}>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => new Date(record.timestamp).toLocaleDateString()}
          secondaryText={(record) => new Date(record.timestamp).toLocaleTimeString()}
          tertiaryText={(record) => record.soil_moisture}
        />
      ) : (
        <Datagrid>
          <FunctionField label={"Date"} render={(record) => new Date(record.timestamp).toLocaleDateString()} />
          <FunctionField label={"Time"} render={(record) => new Date(record.timestamp).toLocaleTimeString()} />
          <TextField source="soil_moisture" />
        </Datagrid>
      )}
    </List>
  );
};
