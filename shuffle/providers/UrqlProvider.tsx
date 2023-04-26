import graphql from "@/config/graphql";
import { PropsWithChildren } from "react";
import { Client, Provider, cacheExchange, fetchExchange } from "urql";

const client = new Client({
  url: graphql.url,
  exchanges: [cacheExchange, fetchExchange],
});

const UrqlProvider = ({ children }: PropsWithChildren<{}>) => (
  <Provider value={client}>{children}</Provider>
);

export default UrqlProvider;
